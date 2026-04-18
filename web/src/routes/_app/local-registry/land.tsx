import { useEffect, useRef, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, MapPinned } from 'lucide-react'

import { fetchApi } from '@/shared/api/client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export const Route = createFileRoute('/_app/local-registry/land')({
  component: LocalRegistryLandPage,
})

const PAGE_SIZE = 20

interface LandCrmItem {
  cadastralNumber: string
  koatuu: string
  ownershipType: string
  intendedPurpose: string
  location: string
  landPurposeType: string
  square: number | null
  estimateValue: number | null
  stateTaxId: string
  user: string
  ownerPart?: number | null
  stateRegistrationDate: string
  ownershipRegistrationId: string
  registrator: string
  type: string
  subtype: string
  validationStatus?: 'VALID' | 'INVALID' | null
  validationErrors?: string[] | null
}

const ERROR_LABELS: Record<string, string> = {
  MISSING_CADASTRAL: 'Missing cadastral number',
  INVALID_CADASTRAL_FORMAT: 'Invalid cadastral number format',
  MISSING_OWNER: 'Missing owner',
  MISSING_RIGHT_TYPE: 'Missing right type',
  MISSING_DATE: 'Missing registration date',
  MISSING_DOCUMENT: 'Missing document number',
}

interface PaginatedList<T> {
  items: T[]
  totalItems: number
  page: number
  pageSize: number
}

type EditableField =
  | 'location'
  | 'ownershipType'
  | 'landPurposeType'
  | 'square'
  | 'estimateValue'
  | 'stateTaxId'
  | 'stateRegistrationDate'
  | 'registrator'

const FIELD_LABELS: Record<EditableField, string> = {
  location: 'Location',
  ownershipType: 'Ownership Type',
  landPurposeType: 'Land Purpose',
  square: 'Area (ha)',
  estimateValue: 'Estimated Value',
  stateTaxId: 'Tax ID',
  stateRegistrationDate: 'Registration Date',
  registrator: 'Registrar',
}

const NUMBER_FIELDS: EditableField[] = ['square', 'estimateValue']
const DATE_FIELDS: EditableField[] = ['stateRegistrationDate']

function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  const d = new Date(value)
  return isNaN(d.getTime()) ? value : d.toLocaleDateString('en-GB')
}

function toInputValue(item: LandCrmItem, field: EditableField): string {
  const val = item[field]
  if (val == null) return ''
  if (DATE_FIELDS.includes(field)) {
    const d = new Date(val as string)
    return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0]
  }
  return String(val)
}

function applyEdit(item: LandCrmItem, field: EditableField, raw: string): LandCrmItem {
  let value: string | number | null = raw
  if (NUMBER_FIELDS.includes(field)) value = raw === '' ? null : Number(raw)
  return { ...item, [field]: value }
}

interface FloatingEditorProps {
  label: string
  value: string
  inputType: string
  anchorRect: DOMRect
  onChange: (v: string) => void
  onCommit: () => void
  onCancel: () => void
}

function FloatingEditor({ label, value, inputType, anchorRect, onChange, onCommit, onCancel }: FloatingEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const popoverWidth = Math.max(anchorRect.width, 280)

  // position: above the cell; flip below if not enough space
  const spaceAbove = anchorRect.top
  const popoverHeight = 80
  const above = spaceAbove >= popoverHeight + 8
  const top = above ? anchorRect.top - popoverHeight - 6 : anchorRect.bottom + 6

  // clamp horizontally inside viewport
  const rawLeft = anchorRect.left + anchorRect.width / 2 - popoverWidth / 2
  const left = Math.max(8, Math.min(rawLeft, window.innerWidth - popoverWidth - 8))

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  return (
    <div
      style={{ position: 'fixed', top, left, width: popoverWidth, zIndex: 50 }}
      className="rounded-lg border bg-popover shadow-lg"
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* arrow */}
      <div
        style={{
          position: 'absolute',
          left: anchorRect.left + anchorRect.width / 2 - left - 6,
          [above ? 'bottom' : 'top']: -5,
          width: 10,
          height: 10,
          background: 'hsl(var(--popover))',
          border: '1px solid hsl(var(--border))',
          transform: 'rotate(45deg)',
          [above ? 'borderTop' : 'borderBottom']: 'none',
          [above ? 'borderLeft' : 'borderRight']: 'none',
          clipPath: above ? 'polygon(0 0, 100% 100%, 100% 0)' : 'polygon(0 100%, 100% 0, 0 0)',
        }}
      />
      <div className="px-3 py-2.5">
        <p className="mb-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
        <input
          ref={inputRef}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onCommit}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              onCancel()
              e.preventDefault()
            }
            if (e.key === 'Enter') inputRef.current?.blur()
          }}
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
    </div>
  )
}

function LocalRegistryLandPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [editState, setEditState] = useState<{
    rowKey: string
    field: EditableField
    anchorRect: DOMRect
  } | null>(null)
  const [editValue, setEditValue] = useState('')
  const editingItemRef = useRef<LandCrmItem | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['crm', 'land', page],
    queryFn: () => fetchApi<PaginatedList<LandCrmItem>>(`/crm/land?page=${page}&pageSize=${PAGE_SIZE}`),
  })

  const { data: totalInvalidCount } = useQuery({
    queryKey: ['crm', 'land', 'invalid-count'],
    queryFn: () => fetchApi<number>('/crm/land/invalid-count'),
  })

  const updateMutation = useMutation({
    mutationFn: (item: LandCrmItem) =>
      fetchApi(`/crm/land/${encodeURIComponent(item.cadastralNumber)}`, {
        method: 'PUT',
        body: JSON.stringify({
          koatuu: item.koatuu,
          ownershipType: item.ownershipType,
          intendedPurpose: item.intendedPurpose,
          location: item.location,
          landPurposeType: item.landPurposeType,
          square: item.square,
          estimateValue: item.estimateValue,
          stateTaxId: item.stateTaxId,
          user: item.user,
          ownerPart: item.ownerPart,
          stateRegistrationDate: item.stateRegistrationDate,
          ownershipRegistrationId: item.ownershipRegistrationId,
          registrator: item.registrator,
          type: item.type,
          subtype: item.subtype,
        }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['crm', 'land'] }),
  })

  const totalPages = data ? Math.ceil(data.totalItems / PAGE_SIZE) : 0

  function startEdit(item: LandCrmItem, field: EditableField, e: React.MouseEvent) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    editingItemRef.current = item
    setEditState({ rowKey: item.cadastralNumber, field, anchorRect: rect })
    setEditValue(toInputValue(item, field))
  }

  function commitEdit() {
    const original = editingItemRef.current
    if (!editState || !original) {
      setEditState(null)
      return
    }
    if (editValue !== toInputValue(original, editState.field)) {
      updateMutation.mutate(applyEdit(original, editState.field, editValue))
    }
    setEditState(null)
    editingItemRef.current = null
  }

  function cancelEdit() {
    setEditState(null)
    editingItemRef.current = null
  }

  function cell(item: LandCrmItem, field: EditableField, display: React.ReactNode) {
    const active = editState?.rowKey === item.cadastralNumber && editState?.field === field
    return (
      <span
        className={`block truncate cursor-default select-none ${active ? 'opacity-40' : ''}`}
        title={typeof display === 'string' ? display : undefined}
        onDoubleClick={(e) => startEdit(item, field, e)}
      >
        {display || <span className="text-muted-foreground">—</span>}
      </span>
    )
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-center gap-2">
          <MapPinned className="size-5 text-muted-foreground" />
          <h1 className="text-xl font-semibold">Local Registry — Land (CRM)</h1>
          <span className="ml-auto flex items-center gap-3 text-sm text-muted-foreground">
            {typeof totalInvalidCount === 'number' && totalInvalidCount > 0 && (
              <span className="flex items-center gap-1 font-medium text-destructive">
                <AlertCircle className="size-4" />
                {totalInvalidCount.toLocaleString('en-US')} invalid
              </span>
            )}
            {data && <>Total: {data.totalItems.toLocaleString('en-US')} records</>}
          </span>
        </div>

        <div className="min-h-0 flex-1 overflow-auto rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Cadastral Number</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Ownership Type</TableHead>
                <TableHead>Land Purpose</TableHead>
                <TableHead className="text-right">Area (ha)</TableHead>
                <TableHead className="text-right">Estimated Value</TableHead>
                <TableHead>Tax ID</TableHead>
                <TableHead>Registration Date</TableHead>
                <TableHead>Registrar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 10 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}

              {isError && (
                <TableRow>
                  <TableCell colSpan={10} className="py-12 text-center text-sm text-destructive">
                    Failed to load data
                  </TableCell>
                </TableRow>
              )}

              {data?.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="py-12 text-center text-sm text-muted-foreground">
                    No records found
                  </TableCell>
                </TableRow>
              )}

              {data?.items.map((item) => {
                const isInvalid = item.validationStatus === 'INVALID'
                const errors = item.validationErrors ?? []
                return (
                  <TableRow
                    key={item.cadastralNumber}
                    className={isInvalid ? 'bg-destructive/5 hover:bg-destructive/10' : ''}
                  >
                    <TableCell className="pr-0">
                      {isInvalid ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertCircle className="size-4 text-destructive cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-64">
                            <p className="mb-1 font-semibold text-destructive">Validation errors:</p>
                            <ul className="space-y-0.5 text-xs">
                              {errors.map((err) => (
                                <li key={err}>• {ERROR_LABELS[err] ?? err}</li>
                              ))}
                            </ul>
                          </TooltipContent>
                        </Tooltip>
                      ) : item.validationStatus === 'VALID' ? (
                        <CheckCircle2 className="size-4 text-emerald-500" />
                      ) : null}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{item.cadastralNumber}</TableCell>
                    <TableCell className="max-w-48">{cell(item, 'location', item.location)}</TableCell>
                    <TableCell>{cell(item, 'ownershipType', item.ownershipType)}</TableCell>
                    <TableCell className="max-w-40">{cell(item, 'landPurposeType', item.landPurposeType)}</TableCell>
                    <TableCell className="text-right">
                      {cell(item, 'square', item.square != null ? item.square.toLocaleString('en-US') : '')}
                    </TableCell>
                    <TableCell className="text-right">
                      {cell(
                        item,
                        'estimateValue',
                        item.estimateValue != null
                          ? item.estimateValue.toLocaleString('en-US', {
                              style: 'currency',
                              currency: 'UAH',
                              maximumFractionDigits: 0,
                            })
                          : '',
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{cell(item, 'stateTaxId', item.stateTaxId)}</TableCell>
                    <TableCell>{cell(item, 'stateRegistrationDate', formatDate(item.stateRegistrationDate))}</TableCell>
                    <TableCell className="max-w-36">{cell(item, 'registrator', item.registrator)}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        )}

        {editState && (
          <FloatingEditor
            label={FIELD_LABELS[editState.field]}
            value={editValue}
            inputType={
              DATE_FIELDS.includes(editState.field)
                ? 'date'
                : NUMBER_FIELDS.includes(editState.field)
                  ? 'number'
                  : 'text'
            }
            anchorRect={editState.anchorRect}
            onChange={setEditValue}
            onCommit={commitEdit}
            onCancel={cancelEdit}
          />
        )}
      </div>
    </TooltipProvider>
  )
}
