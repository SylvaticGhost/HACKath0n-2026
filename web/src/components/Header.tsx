import { ChevronRight } from 'lucide-react'
import { useRouterState } from '@tanstack/react-router'
import { ModeToggle } from '@/components/mode-toggle'

const routeNames: Record<string, string> = {
  '/orders-list': 'Orders List',
  '/import-csv': 'Import CSV',
  '/manual-create': 'Manual Create',
}

export function Header() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const routeTitle = routeNames[pathname] ?? pathname

  return (
    <header className="sticky top-0 z-50 flex h-[50px] w-full items-center justify-end border-b px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <span className="flex-1 flex gap-1 tracking-wide">
        <ChevronRight className="size-5 mt-0.5" strokeWidth={2} /> {routeTitle}
      </span>

      <div className="flex items-center gap-2">
        <ModeToggle />
      </div>
    </header>
  )
}
