import { createFileRoute } from '@tanstack/react-router'
import { Table2 } from 'lucide-react'

export const Route = createFileRoute('/_app/table')({
  component: TablePage,
})

function TablePage() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
      <Table2 className="h-16 w-16 opacity-30" strokeWidth={1} />
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Загальна таблиця</h1>
      <p className="text-sm">Ця сторінка ще в розробці</p>
    </div>
  )
}
