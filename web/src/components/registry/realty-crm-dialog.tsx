import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { RealtyCrmDtoSchema, UpdateRealtyCrmDtoSchema, type RealtyCrmDto } from 'shared'

import { useCreateRealtyCrmRecord, useRealtyCrmRecord, useUpdateRealtyCrmRecord } from '@/hooks/use-registry'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import {
  getRequestErrorMessage,
  getValidationErrorMessage,
  parseOptionalNumber,
  parseOptionalText,
  parseRequiredNumber,
  toDateInputValue,
} from './crm-form-utils'

interface RealtyCrmDialogProps {
  open: boolean
  mode: 'create' | 'edit'
  recordKey?: {
    stateTaxId: string
    ownershipRegistrationDate: string
  } | null
  onOpenChange: (open: boolean) => void
}

type RealtyFormValues = {
  stateTaxId: string
  ownershipRegistrationDate: string
  taxpayerName: string
  objectType: string
  objectAddress: string
  ownershipTerminationDate: string
  totalArea: string
  jointOwnershipType: string
  ownershipShare: string
}

type RealtyFieldName = keyof RealtyFormValues
type RealtyFieldType = 'text' | 'number' | 'date'

interface RealtyFieldConfig {
  name: RealtyFieldName
  label: string
  placeholder: string
  type?: RealtyFieldType
  description?: string
  readOnlyOnEdit?: boolean
}

interface RealtyFieldGroup {
  title: string
  description: string
  fields: RealtyFieldConfig[]
}

const realtyFieldGroups: RealtyFieldGroup[] = [
  {
    title: 'Identity',
    description: 'Composite key and taxpayer identity for the realty record.',
    fields: [
      {
        name: 'stateTaxId',
        label: 'State tax ID',
        placeholder: '3124509876',
        readOnlyOnEdit: true,
      },
      {
        name: 'ownershipRegistrationDate',
        label: 'Ownership registration date',
        placeholder: '2026-04-19',
        type: 'date',
        readOnlyOnEdit: true,
      },
      {
        name: 'taxpayerName',
        label: 'Taxpayer name',
        placeholder: 'Bogdan Kharchenko',
      },
      {
        name: 'jointOwnershipType',
        label: 'Joint ownership type',
        placeholder: 'Shared ownership',
        description: 'Optional field for joint ownership models.',
      },
    ],
  },
  {
    title: 'Property',
    description: 'Main details for the real estate object.',
    fields: [
      {
        name: 'objectType',
        label: 'Object type',
        placeholder: 'Apartment',
      },
      {
        name: 'objectAddress',
        label: 'Object address',
        placeholder: 'Kyiv, Khreshchatyk 22, apt. 17',
      },
      {
        name: 'totalArea',
        label: 'Total area',
        placeholder: '92.4',
        type: 'number',
      },
    ],
  },
  {
    title: 'Ownership',
    description: 'Lifecycle and ownership distribution details.',
    fields: [
      {
        name: 'ownershipTerminationDate',
        label: 'Ownership termination date',
        placeholder: '2026-12-31',
        type: 'date',
        description: 'Optional. Use only if ownership already ended.',
      },
      {
        name: 'ownershipShare',
        label: 'Ownership share',
        placeholder: '0.5',
        type: 'number',
        description: 'Optional share for co-owned property.',
      },
    ],
  },
]

function createEmptyRealtyForm(): RealtyFormValues {
  return {
    stateTaxId: '',
    ownershipRegistrationDate: '',
    taxpayerName: '',
    objectType: '',
    objectAddress: '',
    ownershipTerminationDate: '',
    totalArea: '',
    jointOwnershipType: '',
    ownershipShare: '',
  }
}

function mapRealtyRecordToFormValues(record: RealtyCrmDto): RealtyFormValues {
  return {
    stateTaxId: record.stateTaxId ?? '',
    ownershipRegistrationDate: toDateInputValue(record.ownershipRegistrationDate),
    taxpayerName: record.taxpayerName ?? '',
    objectType: record.objectType ?? '',
    objectAddress: record.objectAddress ?? '',
    ownershipTerminationDate: toDateInputValue(record.ownershipTerminationDate),
    totalArea: record.totalArea === null || record.totalArea === undefined ? '' : String(record.totalArea),
    jointOwnershipType: record.jointOwnershipType ?? '',
    ownershipShare:
      record.ownershipShare === null || record.ownershipShare === undefined ? '' : String(record.ownershipShare),
  }
}

function buildRealtyPayload(values: RealtyFormValues) {
  return {
    stateTaxId: values.stateTaxId.trim(),
    ownershipRegistrationDate: values.ownershipRegistrationDate,
    taxpayerName: values.taxpayerName.trim(),
    objectType: values.objectType.trim(),
    objectAddress: values.objectAddress.trim(),
    ownershipTerminationDate: values.ownershipTerminationDate || null,
    totalArea: parseRequiredNumber(values.totalArea),
    jointOwnershipType: parseOptionalText(values.jointOwnershipType),
    ownershipShare: parseOptionalNumber(values.ownershipShare),
  }
}

function RealtyField({
  config,
  value,
  onChange,
  disabled,
}: {
  config: RealtyFieldConfig
  value: string
  onChange: (name: RealtyFieldName, value: string) => void
  disabled: boolean
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label
          htmlFor={config.name}
          className="text-[11px] font-semibold tracking-[0.2em] uppercase text-muted-foreground"
        >
          {config.label}
        </Label>
        {config.readOnlyOnEdit ? <span className="text-[11px] text-muted-foreground">Locked on edit</span> : null}
      </div>
      <Input
        id={config.name}
        type={config.type ?? 'text'}
        value={value}
        onChange={(event) => onChange(config.name, event.target.value)}
        placeholder={config.placeholder}
        disabled={disabled}
        readOnly={disabled && config.readOnlyOnEdit}
        inputMode={config.type === 'number' ? 'decimal' : undefined}
        className={cn(
          'h-10 border-border/60 bg-background/80 text-sm shadow-none',
          config.readOnlyOnEdit && disabled && 'cursor-not-allowed bg-muted/40 text-muted-foreground',
        )}
      />
      {config.description ? <p className="text-xs leading-5 text-muted-foreground">{config.description}</p> : null}
    </div>
  )
}

export function RealtyCrmDialog({ open, mode, recordKey, onOpenChange }: RealtyCrmDialogProps) {
  const isEdit = mode === 'edit'
  const [formValues, setFormValues] = useState<RealtyFormValues>(createEmptyRealtyForm())
  const [submitError, setSubmitError] = useState<string | null>(null)

  const recordQuery = useRealtyCrmRecord(isEdit && open ? (recordKey ?? null) : null, {
    enabled: isEdit && open,
  })
  const createMutation = useCreateRealtyCrmRecord()
  const updateMutation = useUpdateRealtyCrmRecord()

  const isSubmitting = createMutation.isPending || updateMutation.isPending
  const isLoadingRecord = isEdit && open && recordQuery.isPending && !recordQuery.data
  const loadErrorMessage = recordQuery.error instanceof Error ? recordQuery.error.message : null
  const activeRecordKey =
    recordKey ??
    (recordQuery.data
      ? {
          stateTaxId: recordQuery.data.stateTaxId,
          ownershipRegistrationDate: toDateInputValue(recordQuery.data.ownershipRegistrationDate),
        }
      : null)

  const dialogTitle = useMemo(() => (isEdit ? 'Edit realty record' : 'Add realty record'), [isEdit])
  const dialogDescription = isEdit
    ? 'Update CRM values while keeping the composite key immutable.'
    : 'Create a new realty record directly in the local CRM registry.'

  useEffect(() => {
    if (!open) {
      setSubmitError(null)
      return
    }

    setSubmitError(null)

    if (!isEdit) {
      setFormValues(createEmptyRealtyForm())
    }
  }, [open, isEdit])

  useEffect(() => {
    if (open && isEdit && recordQuery.data) {
      setFormValues(mapRealtyRecordToFormValues(recordQuery.data))
    }
  }, [open, isEdit, recordQuery.data])

  function handleFieldChange(name: RealtyFieldName, value: string) {
    setSubmitError(null)
    setFormValues((currentValues) => ({ ...currentValues, [name]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const payload = buildRealtyPayload(formValues)

    if (isEdit) {
      const validatedPayload = UpdateRealtyCrmDtoSchema.safeParse({
        taxpayerName: payload.taxpayerName,
        objectType: payload.objectType,
        objectAddress: payload.objectAddress,
        ownershipTerminationDate: payload.ownershipTerminationDate,
        totalArea: payload.totalArea,
        jointOwnershipType: payload.jointOwnershipType,
        ownershipShare: payload.ownershipShare,
      })

      if (!validatedPayload.success) {
        setSubmitError(getValidationErrorMessage(validatedPayload.error))
        return
      }

      if (!activeRecordKey) {
        setSubmitError('Missing composite key for the selected record')
        return
      }

      try {
        await updateMutation.mutateAsync({
          stateTaxId: activeRecordKey.stateTaxId,
          ownershipRegistrationDate: activeRecordKey.ownershipRegistrationDate,
          dto: validatedPayload.data,
        })
        onOpenChange(false)
      } catch (error) {
        setSubmitError(getRequestErrorMessage(error, 'Failed to update realty record'))
      }

      return
    }

    const validatedPayload = RealtyCrmDtoSchema.safeParse(payload)

    if (!validatedPayload.success) {
      setSubmitError(getValidationErrorMessage(validatedPayload.error))
      return
    }

    try {
      await createMutation.mutateAsync(validatedPayload.data)
      onOpenChange(false)
    } catch (error) {
      setSubmitError(getRequestErrorMessage(error, 'Failed to create realty record'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-hidden p-0 sm:max-w-3xl">
        <form onSubmit={handleSubmit} className="flex max-h-[90vh] flex-col overflow-hidden">
          <div className="border-b border-border/60 bg-muted/20 px-6 py-5">
            <DialogHeader className="gap-2 text-left">
              <div className="text-[11px] font-semibold tracking-[0.22em] uppercase text-muted-foreground">
                {isEdit ? 'Update CRM record' : 'Create CRM record'}
              </div>
              <DialogTitle className="text-xl tracking-tight">{dialogTitle}</DialogTitle>
              <DialogDescription className="max-w-2xl text-sm leading-6">{dialogDescription}</DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            {loadErrorMessage ? (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{loadErrorMessage}</AlertDescription>
              </Alert>
            ) : null}

            {submitError ? (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            ) : null}

            {isLoadingRecord ? (
              <div className="flex min-h-56 items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 size-4 animate-spin" />
                Loading realty record
              </div>
            ) : isEdit && !recordQuery.data && !loadErrorMessage ? null : (
              <div className="grid gap-4">
                {realtyFieldGroups.map((group) => (
                  <section
                    key={group.title}
                    className="rounded-2xl border border-border/60 bg-background/70 p-4 shadow-[0_1px_0_rgba(255,255,255,0.04)]"
                  >
                    <div className="mb-4 space-y-1">
                      <h3 className="text-sm font-semibold tracking-tight">{group.title}</h3>
                      <p className="text-xs leading-5 text-muted-foreground">{group.description}</p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {group.fields.map((field) => (
                        <RealtyField
                          key={field.name}
                          config={field}
                          value={formValues[field.name]}
                          onChange={handleFieldChange}
                          disabled={isSubmitting || (isEdit && Boolean(field.readOnlyOnEdit))}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="border-t border-border/60 bg-background px-6 py-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoadingRecord || (isEdit && Boolean(loadErrorMessage))}>
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              {isEdit ? 'Save changes' : 'Create record'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
