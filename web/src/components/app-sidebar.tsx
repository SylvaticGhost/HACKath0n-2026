import * as React from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { useTheme } from 'next-themes'
import { Building2, ChevronDown, FileUp, Globe2, Landmark, LogOut, MapPinned, Moon, Sun } from 'lucide-react'

import { ModeToggle } from '@/components/mode-toggle'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from '@/components/ui/sidebar'

interface NavigationItem {
  label: string
  to: string
  icon: React.ComponentType<{ className?: string }>
}

interface RegistryGroup {
  label: string
  icon: React.ComponentType<{ className?: string }>
  items: NavigationItem[]
}

const primaryItems: NavigationItem[] = [{ label: 'Upload File', to: '/upload_file', icon: FileUp }]

const registryGroups: RegistryGroup[] = [
  {
    label: 'Global Registry',
    icon: Globe2,
    items: [
      { label: 'Land', to: '/global-registry/land', icon: MapPinned },
      { label: 'Realty', to: '/global-registry/realty', icon: Building2 },
    ],
  },
  {
    label: 'Local Registry',
    icon: Landmark,
    items: [
      { label: 'Land', to: '/local-registry/land', icon: MapPinned },
      { label: 'Realty', to: '/local-registry/realty', icon: Building2 },
    ],
  },
]

function isPathActive(pathname: string, to: string) {
  return pathname === to || pathname.startsWith(`${to}/`)
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
              {registryGroups.map((group) => {
                const groupActive = group.items.some((item) => isPathActive(pathname, item.to))

                return (
                  <Collapsible key={group.label} defaultOpen={groupActive} className="group/collapsible">
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          size="lg"
                          isActive={groupActive}
                          tooltip={group.label}
                          className="group-data-[collapsible=icon]:size-9! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0"
                        >
                          <group.icon className="size-5 group-data-[collapsible=icon]:size-[18px]" />
                          <span>{group.label}</span>
                          <ChevronDown className="ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-180 group-data-[collapsible=icon]:hidden" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <SidebarMenuSub className="border-l-0 pl-3">
                          {group.items.map((item) => {
                            const active = isPathActive(pathname, item.to)

                            return (
                              <SidebarMenuSubItem key={item.to}>
                                <SidebarMenuSubButton asChild isActive={active} className="h-9 text-[15px]">
                                  <Link to={item.to}>
                                    <item.icon className="size-5" />
                                    <span>{item.label}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            )
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                )
              })}
              {primaryItems.map((item) => {
                const active = isPathActive(pathname, item.to)

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
