import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/_app/drag-drop')({
  component: DragDropPage,
})

function DragDropPage() {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    // Stub: just log the files
    const files = Array.from(e.dataTransfer.files)
    console.log('Dropped files:', files)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Drag & Drop File</h1>
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver ? 'border-primary bg-primary/10' : 'border-muted-foreground'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <p className="text-muted-foreground">Drag and drop a file here, or click to select a file</p>
        <input type="file" className="hidden" />
      </div>
    </div>
  )
}
