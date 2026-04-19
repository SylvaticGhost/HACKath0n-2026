import { useState } from 'react'
import { Loader2, CheckCircle } from 'lucide-react'
import type { AnomalyDto } from 'shared'
import { toast } from 'sonner'
import { useResolveAnomaly } from '@/hooks/use-anomalies'
import { Button } from '@/components/ui/button'
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
  const mutation = useResolveAnomaly()

  const handleResolve = () => {
    setOpen(false)
    // Даємо Radix UI Dialog сигнал на закриття ДО того, як спрацює оптимістичне оновлення і змінить UI
    setTimeout(() => {
      mutation.mutate(anomaly.id, {
        onSuccess: () => {
          toast.success(`Anomaly ${anomaly.id} resolved successfully`)
        },
        onError: (error) => {
          toast.error(`Failed to resolve anomaly: ${error.message}`)
        },
      })
    }, 10)
  }

  const isResolved = String(anomaly.status).toUpperCase() === 'RESOLVED'

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${isResolved ? 'opacity-50' : ''}`}
          title={isResolved ? 'Resolved' : 'Mark as resolved'}
          disabled={isResolved || mutation.isPending}
        >
          <CheckCircle className={`size-4 ${isResolved ? '' : 'text-green-500'}`} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resolve Anomaly</DialogTitle>
          <DialogDescription>
            Are you sure you want to mark this anomaly as resolved? This action confirms that the inconsistency has been
            verified and handled.
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
  )
}
