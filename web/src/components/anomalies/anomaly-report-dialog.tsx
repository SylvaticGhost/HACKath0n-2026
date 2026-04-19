import { useMemo } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import type { AnomalyDto } from 'shared'

import { useAnomalyDetails } from '@/hooks/use-anomalies'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDateValue } from '@/components/registry/registry-column-helpers'

interface AnomalyReportDialogProps {
  anomaly: AnomalyDto
  open: boolean
  onOpenChange: (open: boolean) => void
}

const AUTHORITY_NAME = 'Головне управління Держгеокадастру у Львівській області'
const AUTHORITY_EMAIL = 'lviv@land.gov.ua'

function normalizeValue(value: unknown) {
  if (value === null || value === undefined) {
    return null
  }

  if (typeof value === 'string' && value.trim().length === 0) {
    return null
  }

  return String(value)
}

export function AnomalyReportDialog({ anomaly, open, onOpenChange }: AnomalyReportDialogProps) {
  const detailsQuery = useAnomalyDetails(anomaly.id, { enabled: open })

  const reportTemplate = useMemo(() => {
    const details = detailsQuery.data
    if (!details) {
      return ''
    }

    const { anomaly: anomalyDetails, land, realty } = details
    const hasMatchedRealtyAddress = Boolean(anomalyDetails.realtyAddress?.trim())
    const today = formatDateValue(new Date())
    const cadastralNumber = normalizeValue(anomalyDetails.cadastralNumber)
    const landAddress = normalizeValue(anomalyDetails.landAddress)
    const landOwner = normalizeValue(land?.user)
    const landOwnerId = normalizeValue(land?.stateTaxId)
    const senderFullName = normalizeValue(land?.user)
    const senderPostAddress = normalizeValue(land?.location) ?? landAddress
    const senderEmail = normalizeValue(land?.propertyInfo?.email)
    const senderPhone = normalizeValue(land?.propertyInfo?.phone)
    const anomalyReason = normalizeValue(anomalyDetails.matchReason)

    const subjectSuffix = cadastralNumber ? ` (Кадастровий номер: ${cadastralNumber})` : ''

    const lines: string[] = [
      `Тема: Електронне звернення: виявлено аномалію у реєстрах даних нерухомості${subjectSuffix}`,
      '',
      `Кому: ${AUTHORITY_NAME} <${AUTHORITY_EMAIL}>`,
      'ЗАЯВА (ЕЛЕКТРОННЕ ЗВЕРНЕННЯ)',
      'про перевірку даних та усунення розбіжностей у державних реєстрах',
      '',
      `Шановні представники ${AUTHORITY_NAME},`,
      '',
      'За допомогою програмного забезпечення для аналітичного моніторингу відкритих даних було виявлено розбіжність (аномалію), яка потребує перевірки та усунення відповідним органом.',
      '',
    ]

    if (senderFullName) {
      lines.splice(3, 0, `Від кого: ${senderFullName}`)
    }

    if (senderPostAddress) {
      lines.splice(lines.indexOf('ЗАЯВА (ЕЛЕКТРОННЕ ЗВЕРНЕННЯ)'), 0, `Адреса реєстрації: ${senderPostAddress}`)
    }

    if (senderEmail) {
      lines.splice(lines.indexOf('ЗАЯВА (ЕЛЕКТРОННЕ ЗВЕРНЕННЯ)'), 0, `Електронна пошта для відповіді: ${senderEmail}`)
    }

    if (senderPhone) {
      lines.splice(lines.indexOf('ЗАЯВА (ЕЛЕКТРОННЕ ЗВЕРНЕННЯ)'), 0, `Телефон: ${senderPhone}`)
    }

    if (senderFullName || senderPostAddress || senderEmail || senderPhone) {
      lines.splice(lines.indexOf('ЗАЯВА (ЕЛЕКТРОННЕ ЗВЕРНЕННЯ)'), 0, '')
    }

    if (anomalyReason) {
      lines.push(`Суть виявленої аномалії: ${anomalyReason}.`, '')
    }

    const landDetails: string[] = []
    if (cadastralNumber) {
      landDetails.push(`- Кадастровий номер: ${cadastralNumber}`)
    }
    if (landAddress) {
      landDetails.push(`- Адреса земельної ділянки: ${landAddress}`)
    }
    if (landOwner && landOwnerId) {
      landDetails.push(`- Власник/користувач: ${landOwner} (Код: ${landOwnerId})`)
    } else if (landOwner) {
      landDetails.push(`- Власник/користувач: ${landOwner}`)
    } else if (landOwnerId) {
      landDetails.push(`- Код власника/користувача: ${landOwnerId}`)
    }

    if (landDetails.length > 0) {
      lines.push('Деталі земельної ділянки (ДЗК):', ...landDetails, '')
    }

    if (hasMatchedRealtyAddress && realty.length > 0) {
      const realtyLines = realty
        .map((item) => {
          const objectType = normalizeValue(item.objectType)
          const objectAddress = normalizeValue(item.objectAddress)
          const stateTaxId = normalizeValue(item.stateTaxId)
          const taxpayerName = normalizeValue(item.taxpayerName)

          const parts = [
            objectType,
            objectAddress,
            stateTaxId ? `ІПН: ${stateTaxId}` : null,
            taxpayerName ? `Платник: ${taxpayerName}` : null,
            item.ownershipRegistrationDate
              ? `Дата реєстрації: ${formatDateValue(item.ownershipRegistrationDate)}`
              : null,
          ].filter((part): part is string => Boolean(part))

          return parts.join(' | ')
        })
        .filter((line) => line.length > 0)
        .map((line, index) => `${index + 1}) ${line}`)

      if (realtyLines.length > 0) {
        lines.push("Дані об'єктів нерухомості (ДРРП), що зареєстровані за цією ж адресою:")
        realtyLines.forEach((line) => {
          lines.push(`- ${line}`)
        })
        lines.push('')
      }
    }

    const responseTarget = senderEmail
      ? `на вказану електронну пошту (${senderEmail})`
      : 'на контактні реквізити заявника'

    lines.push(
      '',
      'Наявність квартир приватних осіб на земельній ділянці з таким цільовим призначенням / без відповідного розділення адрес є технічною помилкою або порушенням правил реєстрації.',
      '',
      'Прошу в межах вашої компетенції:',
      "1. Провести перевірку вказаних об'єктів у відповідних державних реєстрах.",
      "2. Вжити заходів щодо виправлення виявленої технічної помилки, уточнення поштової адреси об'єктів або актуалізації відомостей про земельну ділянку.",
      `3. Надати відповідь за результатами розгляду ${responseTarget} у терміни, передбачені ст. 20 Закону України «Про звернення громадян».`,
      '',
      'З повагою,',
      `Дата: ${today}`,
    )

    if (senderFullName) {
      lines.splice(lines.lastIndexOf(`Дата: ${today}`), 0, senderFullName)
    }

    return lines.join('\n')
  }, [detailsQuery.data])

  const errorMessage = detailsQuery.error instanceof Error ? detailsQuery.error.message : 'Unable to load report data.'

  const handleSend = () => {
    toast.success(`Рапорт по аномалії №${anomaly.id} відправлено`)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-hidden p-0 sm:max-w-4xl"
        showCloseButton
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Global Registry Change Report</DialogTitle>
          <DialogDescription>Review the report template and send it for registry update processing.</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[68vh] px-6 py-6">
          {detailsQuery.isLoading ? (
            <div className="flex items-center gap-2 rounded-md border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading report template...
            </div>
          ) : null}

          {detailsQuery.isError ? (
            <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 size-4" />
              <span>{errorMessage}</span>
            </div>
          ) : null}

          {detailsQuery.data ? (
            <pre className="rounded-md border bg-background p-4 text-xs leading-6 whitespace-pre-wrap">
              {reportTemplate}
            </pre>
          ) : null}
        </ScrollArea>

        <DialogFooter className="border-t px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={!detailsQuery.data || detailsQuery.isLoading || detailsQuery.isError}>
            Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
