import { MoreHorizontal, PencilLine, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface RegistryRowActionsProps {
  recordLabel: string
  onEdit: () => void
  onDelete: () => void
  disabled?: boolean
}

export function RegistryRowActions({ recordLabel, onEdit, onDelete, disabled = false }: RegistryRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-xs"
          className="size-7 rounded-full text-muted-foreground hover:text-foreground"
          aria-label={`Open actions for ${recordLabel}`}
          disabled={disabled}
        >
          <MoreHorizontal className="size-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-42">
        <DropdownMenuItem onSelect={onEdit}>
          <PencilLine className="size-3.5" />
          Edit record
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onSelect={onDelete}>
          <Trash2 className="size-3.5" />
          Delete record
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
