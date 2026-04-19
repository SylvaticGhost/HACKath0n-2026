import { useState } from 'react'
import { Loader2, CheckCircle, FileSpreadsheet } from 'lucide-react'
import type { AnomalyDto } from 'shared'
import { toast } from 'sonner'
import { useResolveAnomaly } from '@/hooks/use-anomalies'
import { Button } from '@/components/ui/button'
import { AnomalyReportDialog } from './anomaly-report-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface AnomaliesRowActionsProps {
  anomaly: AnomalyDto
}

export function AnomaliesRowActions({ anomaly }: AnomaliesRowActionsProps) {
  const [open, setOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const mutation = useResolveAnomaly()

  const handleResolve = () => {
    setOpen(false)
    // Даємо Radix UI Dialog сигнал на закриття ДО того, як спрацює оптимістичне оновлення і змінить UI
    setTimeout(() => {
      mutation.mutate(anomaly.id, {
        onSuccess: () => {
          toast.success(`Аномалію №${anomaly.id} успішно позначено як вирішену`)
        },
        onError: (error) => {
          toast.error(`Не вдалося позначити аномалію як вирішену: ${error.message}`)
        },
      })
    }, 10)
  }

  const isResolved = String(anomaly.status).toUpperCase() === 'RESOLVED'

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        title="Prepare report"
        onClick={(event) => {
          event.stopPropagation()
          setReportOpen(true)
        }}
      >
        <FileSpreadsheet className="size-4 text-blue-500" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${isResolved ? 'opacity-50' : ''}`}
            title={isResolved ? 'Resolved' : 'Mark as resolved'}
            disabled={isResolved || mutation.isPending}
            onClick={(event) => event.stopPropagation()}
          >
            <CheckCircle className={`size-4 ${isResolved ? '' : 'text-green-500'}`} />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Anomaly</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this anomaly as resolved? This action confirms that the inconsistency has
              been verified and handled.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button onClick={handleResolve} disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AnomalyReportDialog anomaly={anomaly} open={reportOpen} onOpenChange={setReportOpen} />
    </div>
  )
}
