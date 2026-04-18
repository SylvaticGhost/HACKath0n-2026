import { createFileRoute } from '@tanstack/react-router'
import { Send } from 'lucide-react'

export const Route = createFileRoute('/_app/requests')({
  component: RequestsPage,
})

function RequestsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
      <Send className="h-16 w-16 opacity-30" strokeWidth={1} />
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Реквести</h1>
      <p className="text-sm">Ця сторінка ще в розробці</p>
    </div>
  )
}
