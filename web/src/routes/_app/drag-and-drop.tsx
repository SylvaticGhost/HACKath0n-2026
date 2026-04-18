import { createFileRoute } from '@tanstack/react-router'
import { GripVertical } from 'lucide-react'

export const Route = createFileRoute('/_app/drag-and-drop')({
  component: DragAndDropPage,
})

function DragAndDropPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
      <GripVertical className="h-16 w-16 opacity-30" strokeWidth={1} />
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Drag & Drop</h1>
      <p className="text-sm">Ця сторінка ще в розробці</p>
    </div>
  )
}
