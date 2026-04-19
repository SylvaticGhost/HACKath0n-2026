import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { LandCrmDtoSchema, UpdateLandCrmDtoSchema, type LandCrmDto } from 'shared'

import { useCreateLandCrmRecord, useLandCrmRecord, useUpdateLandCrmRecord } from '@/hooks/use-registry'
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
  parseRequiredNumber,
  toDateInputValue,
} from './crm-form-utils'

interface LandCrmDialogProps {
  open: boolean
  mode: 'create' | 'edit'
  cadastralNumber?: string | null
  onOpenChange: (open: boolean) => void
}

type LandFormValues = {
  cadastralNumber: string
  koatuu: string
  ownershipType: string
  intendedPurpose: string
  location: string
  landPurposeType: string
  square: string
  estimateValue: string
  stateTaxId: string
  user: string
  ownerPart: string
  stateRegistrationDate: string
  ownershipRegistrationId: string
  registrator: string
  type: string
  subtype: string
}

type LandFieldName = keyof LandFormValues
type LandFieldType = 'text' | 'number' | 'date'

interface LandFieldConfig {
  name: LandFieldName
  label: string
  placeholder: string
  type?: LandFieldType
  description?: string
  readOnlyOnEdit?: boolean
}

interface LandFieldGroup {
  title: string
  description: string
  fields: LandFieldConfig[]
}

const landFieldGroups: LandFieldGroup[] = [
  {
    title: 'Identity',
    description: 'Primary identifiers for the land record.',
    fields: [
      {
        name: 'cadastralNumber',
        label: 'Cadastral number',
        placeholder: '1820881500:01:001:0001',
        readOnlyOnEdit: true,
      },
      {
        name: 'koatuu',
        label: 'KOATUU',
        placeholder: '1820881500',
      },
      {
        name: 'stateTaxId',
        label: 'State tax ID',
        placeholder: '3124509876',
      },
      {
        name: 'user',
        label: 'User',
        placeholder: 'Bogdan Kharchenko',
      },
    ],
  },
  {
    title: 'Location',
    description: 'Purpose and physical placement of the land plot.',
    fields: [
      {
        name: 'location',
        label: 'Location',
        placeholder: 'Kyiv Oblast, Boryspil district',
      },
      {
        name: 'intendedPurpose',
        label: 'Intended purpose',
        placeholder: 'Agricultural production',
      },
      {
        name: 'landPurposeType',
        label: 'Land purpose type',
        placeholder: 'Agricultural',
      },
      {
        name: 'type',
        label: 'Type',
        placeholder: 'Land plot',
      },
      {
        name: 'subtype',
        label: 'Subtype',
        placeholder: 'Private ownership',
      },
    ],
  },
  {
    title: 'Ownership',
    description: 'Ownership model and value-related data.',
    fields: [
      {
        name: 'ownershipType',
        label: 'Ownership type',
        placeholder: 'Private',
      },
      {
        name: 'square',
        label: 'Square',
        placeholder: '4.12',
        type: 'number',
      },
      {
        name: 'estimateValue',
        label: 'Estimate value',
        placeholder: '950000',
        type: 'number',
      },
      {
        name: 'ownerPart',
        label: 'Owner part',
        placeholder: '0.5',
        type: 'number',
        description: 'Optional field. Leave empty if not applicable.',
      },
    ],
  },
  {
    title: 'Registration',
    description: 'Registration details used for traceability.',
    fields: [
      {
        name: 'stateRegistrationDate',
        label: 'State registration date',
        placeholder: '2026-04-19',
        type: 'date',
      },
      {
        name: 'ownershipRegistrationId',
        label: 'Ownership registration ID',
        placeholder: 'REG-2026-00421',
      },
      {
        name: 'registrator',
        label: 'Registrator',
        placeholder: 'Central registration office',
      },
    ],
  },
]

function createEmptyLandForm(): LandFormValues {
  return {
    cadastralNumber: '',
    koatuu: '',
    ownershipType: '',
    intendedPurpose: '',
    location: '',
    landPurposeType: '',
    square: '',
    estimateValue: '',
    stateTaxId: '',
    user: '',
    ownerPart: '',
    stateRegistrationDate: '',
    ownershipRegistrationId: '',
    registrator: '',
    type: '',
    subtype: '',
  }
}

function mapLandRecordToFormValues(record: LandCrmDto): LandFormValues {
  return {
    cadastralNumber: record.cadastralNumber ?? '',
    koatuu: record.koatuu ?? '',
    ownershipType: record.ownershipType ?? '',
    intendedPurpose: record.intendedPurpose ?? '',
    location: record.location ?? '',
    landPurposeType: record.landPurposeType ?? '',
    square: record.square === null || record.square === undefined ? '' : String(record.square),
    estimateValue:
      record.estimateValue === null || record.estimateValue === undefined ? '' : String(record.estimateValue),
    stateTaxId: record.stateTaxId ?? '',
    user: record.user ?? '',
    ownerPart: record.ownerPart === null || record.ownerPart === undefined ? '' : String(record.ownerPart),
    stateRegistrationDate: toDateInputValue(record.stateRegistrationDate),
    ownershipRegistrationId: record.ownershipRegistrationId ?? '',
    registrator: record.registrator ?? '',
    type: record.type ?? '',
    subtype: record.subtype ?? '',
  }
}

function buildLandPayload(values: LandFormValues) {
  return {
    cadastralNumber: values.cadastralNumber.trim(),
    koatuu: values.koatuu.trim(),
    ownershipType: values.ownershipType.trim(),
    intendedPurpose: values.intendedPurpose.trim(),
    location: values.location.trim(),
    landPurposeType: values.landPurposeType.trim(),
    square: parseRequiredNumber(values.square),
    estimateValue: parseRequiredNumber(values.estimateValue),
    stateTaxId: values.stateTaxId.trim(),
    user: values.user.trim(),
    ownerPart: parseOptionalNumber(values.ownerPart),
    stateRegistrationDate: values.stateRegistrationDate,
    ownershipRegistrationId: values.ownershipRegistrationId.trim(),
    registrator: values.registrator.trim(),
    type: values.type.trim(),
    subtype: values.subtype.trim(),
  }
}

function LandField({
  config,
  value,
  onChange,
  disabled,
}: {
  config: LandFieldConfig
  value: string
  onChange: (name: LandFieldName, value: string) => void
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

export function LandCrmDialog({ open, mode, cadastralNumber, onOpenChange }: LandCrmDialogProps) {
  const isEdit = mode === 'edit'
  const [formValues, setFormValues] = useState<LandFormValues>(createEmptyLandForm())
  const [submitError, setSubmitError] = useState<string | null>(null)

  const recordQuery = useLandCrmRecord(isEdit && open ? (cadastralNumber ?? null) : null, {
    enabled: isEdit && open,
  })
  const createMutation = useCreateLandCrmRecord()
  const updateMutation = useUpdateLandCrmRecord()

  const isSubmitting = createMutation.isPending || updateMutation.isPending
  const isLoadingRecord = isEdit && open && recordQuery.isPending && !recordQuery.data
  const loadErrorMessage = recordQuery.error instanceof Error ? recordQuery.error.message : null
  const activeKey = cadastralNumber ?? recordQuery.data?.cadastralNumber ?? null

  const dialogTitle = useMemo(() => (isEdit ? 'Edit land record' : 'Add land record'), [isEdit])
  const dialogDescription = isEdit
    ? 'Update CRM values while keeping the cadastral number immutable.'
    : 'Create a new land record directly in the local CRM registry.'

  useEffect(() => {
    if (!open) {
      setSubmitError(null)
      return
    }

    setSubmitError(null)

    if (!isEdit) {
      setFormValues(createEmptyLandForm())
    }
  }, [open, isEdit])

  useEffect(() => {
    if (open && isEdit && recordQuery.data) {
      setFormValues(mapLandRecordToFormValues(recordQuery.data))
    }
  }, [open, isEdit, recordQuery.data])

  function handleFieldChange(name: LandFieldName, value: string) {
    setSubmitError(null)
    setFormValues((currentValues) => ({ ...currentValues, [name]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const payload = buildLandPayload(formValues)

    if (isEdit) {
      const validatedPayload = UpdateLandCrmDtoSchema.safeParse({
        koatuu: payload.koatuu,
        ownershipType: payload.ownershipType,
        intendedPurpose: payload.intendedPurpose,
        location: payload.location,
        landPurposeType: payload.landPurposeType,
        square: payload.square,
        estimateValue: payload.estimateValue,
        stateTaxId: payload.stateTaxId,
        user: payload.user,
        ownerPart: payload.ownerPart,
        stateRegistrationDate: payload.stateRegistrationDate,
        ownershipRegistrationId: payload.ownershipRegistrationId,
        registrator: payload.registrator,
        type: payload.type,
        subtype: payload.subtype,
      })

      if (!validatedPayload.success) {
        setSubmitError(getValidationErrorMessage(validatedPayload.error))
        return
      }

      if (!activeKey) {
        setSubmitError('Missing cadastral number for the selected record')
        return
      }

      try {
        await updateMutation.mutateAsync({
          cadastralNumber: activeKey,
          dto: validatedPayload.data,
        })
        onOpenChange(false)
      } catch (error) {
        setSubmitError(getRequestErrorMessage(error, 'Failed to update land record'))
      }

      return
    }

    const validatedPayload = LandCrmDtoSchema.safeParse(payload)

    if (!validatedPayload.success) {
      setSubmitError(getValidationErrorMessage(validatedPayload.error))
      return
    }

    try {
      await createMutation.mutateAsync(validatedPayload.data)
      onOpenChange(false)
    } catch (error) {
      setSubmitError(getRequestErrorMessage(error, 'Failed to create land record'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-hidden p-0 sm:max-w-4xl">
        <form onSubmit={handleSubmit} className="flex max-h-[90vh] flex-col overflow-hidden">
          <div className="border-b border-border/60 bg-muted/20 px-6 py-5">
            <DialogHeader className="gap-2 text-left">
              <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.22em] uppercase text-muted-foreground">
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
              <div className="flex min-h-60 items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 size-4 animate-spin" />
                Loading land record
              </div>
            ) : isEdit && !recordQuery.data && !loadErrorMessage ? null : (
              <div className="grid gap-4 lg:grid-cols-2">
                {landFieldGroups.map((group) => (
                  <section
                    key={group.title}
                    className="rounded-2xl border border-border/60 bg-background/70 p-4 shadow-[0_1px_0_rgba(255,255,255,0.04)]"
                  >
                    <div className="mb-4 space-y-1">
                      <h3 className="text-sm font-semibold tracking-tight">{group.title}</h3>
                      <p className="text-xs leading-5 text-muted-foreground">{group.description}</p>
                    </div>
                    <div className="grid gap-4">
                      {group.fields.map((field) => (
                        <LandField
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
