import { ChevronRight, LogOut } from 'lucide-react'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ModeToggle } from '@/components/mode-toggle'
import type { UserLoggedDto } from 'shared'
import Cookies from 'js-cookie'

const routeNames: Record<string, string> = {
  '/orders-list': 'Orders List',
  '/import-csv': 'Import CSV',
  '/manual-create': 'Manual Create',
}

const getInitials = (name: string) => {
  if (!name) return 'U'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
}

export function Header({ user }: { user: UserLoggedDto['user'] }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const routeTitle = routeNames[pathname] ?? pathname
  const navigate = useNavigate()

  const handleSignOut = () => {
    Cookies.remove('session')
    navigate({ to: '/login', search: { redirect: '/' } })
  }

  return (
    <header className="sticky top-0 z-50 flex h-[50px] w-full items-center justify-end border-b px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <span className="flex-1 flex gap-1 tracking-wide">
        <ChevronRight className="size-5 mt-0.5" strokeWidth={2} /> {routeTitle}
      </span>

      <div className="flex items-center gap-2">
        <ModeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="outline-none" title="Profile">
              <Avatar className="h-8 w-8 ring-1 ring-ring hover:ring-primary focus:ring-primary cursor-pointer">
                <AvatarImage src={user.avatarUrl} alt={user.displayName} />
                <AvatarFallback>{getInitials(user.displayName!)}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.displayName}</p>
                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
