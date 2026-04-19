import * as React from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { useTheme } from 'next-themes'
import {
  FileUp,
  GitCompare,
  Globe2,
  Landmark,
  LayoutDashboardIcon,
  LogOut,
  AlertTriangle,
  Moon,
  Sun,
} from 'lucide-react'

import { ModeToggle } from '@/components/mode-toggle'
import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar'

interface NavigationItem {
  label: string
  to: string
  activePrefix?: string
  icon: React.ComponentType<{ className?: string }>
}

const navigationItems: NavigationItem[] = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboardIcon },
  { label: 'Global Registry', to: '/global-registry/land', activePrefix: '/global-registry', icon: Globe2 },
  { label: 'Local Registry', to: '/local-registry/land', activePrefix: '/local-registry', icon: Landmark },
  { label: 'Diff', to: '/diff/land', activePrefix: '/diff', icon: GitCompare },
  { label: 'Anomalies', to: '/anomalies', activePrefix: '/anomalies', icon: AlertTriangle },
  { label: 'Upload File', to: '/upload_file', icon: FileUp },
]

function isPathActive(pathname: string, item: NavigationItem) {
  const prefix = item.activePrefix ?? item.to
  return pathname === item.to || pathname.startsWith(`${prefix}/`)
}

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const toggleThemeCompact = React.useCallback(() => {
    setTheme(isDark ? 'light' : 'dark')
  }, [isDark, setTheme])

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="h-14 p-2 group-data-[collapsible=icon]:p-1">
        <div className="h-full overflow-hidden rounded-xl border border-sidebar-border bg-sidebar-accent/30 px-2">
          <div className="flex h-full w-full items-center gap-3 group-data-[collapsible=icon]:justify-center">
            <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground shadow-sm group-data-[collapsible=icon]:size-7">
              <Landmark className="size-4" />
            </div>
            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-sm font-semibold uppercase tracking-[0.18em] text-sidebar-foreground">OTG</p>
              <p className="truncate text-[11px] font-medium uppercase tracking-[0.28em] text-sidebar-foreground/70">
                Registry
              </p>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator className="mx-0 w-full group-data-[collapsible=icon]:hidden" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {navigationItems.map((item) => {
                const active = isPathActive(pathname, item)

                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      size="lg"
                      asChild
                      isActive={active}
                      tooltip={item.label}
                      className="group-data-[collapsible=icon]:size-9! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0"
                    >
                      <Link to={item.to}>
                        <item.icon className="size-5 group-data-[collapsible=icon]:size-[18px]" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator className="mx-0 w-full group-data-[collapsible=icon]:hidden" />

      <SidebarFooter>
        <div className="flex items-center justify-between rounded-md border border-sidebar-border px-2 py-2 group-data-[collapsible=icon]:hidden">
          <span className="text-xs font-medium text-sidebar-foreground/80">Theme</span>
          <ModeToggle />
        </div>

        <Button
          variant="outline"
          size="icon"
          className="hidden size-8 border-sidebar-border group-data-[collapsible=icon]:inline-flex"
          aria-label="Toggle theme"
          onClick={toggleThemeCompact}
        >
          {isDark ? <Moon className="size-4" /> : <Sun className="size-4" />}
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
        >
          <LogOut className="size-4" />
          <span className="group-data-[collapsible=icon]:hidden">Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
