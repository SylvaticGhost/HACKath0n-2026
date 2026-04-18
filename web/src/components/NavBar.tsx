import { createLink, useRouterState } from '@tanstack/react-router'
import React from 'react'
import { twMerge } from 'tailwind-merge'
import { Upload, ListOrdered } from 'lucide-react'
import { motion } from 'framer-motion'
import { ModeToggle } from '@/components/mode-toggle'

const MotionAnchor = React.forwardRef<HTMLAnchorElement, React.ComponentProps<typeof motion.a>>((props, ref) => (
  <motion.a ref={ref} {...props} />
))
const MotionLink = createLink(MotionAnchor)

const menuItems = [
  { label: 'Table Registry', href: '/table-registry', icon: ListOrdered },
  { label: 'Drag & Drop File', href: '/drag-drop', icon: Upload },
]

export default function NavBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <nav className="h-screen w-[190px] shrink-0 border-r border-sidebar-border bg-sidebar p-2 flex flex-col items-start gap-4 pb-3">
      <div className="flex items-center gap-2 px-1 py-1">
        <span className="tracking-tighter font-semibold text-lg text-muted-foreground brightness-125">
          Nest+React app
        </span>
      </div>

      <div className="space-y-1 w-full">
        {menuItems.map((item) => (
          <MotionLink
            key={item.href}
            to={item.href}
            className={twMerge(
              'relative flex h-10 w-full items-center transition-colors rounded-[4px]',
              pathname === item.href
                ? 'text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
            title={item.label}
          >
            {pathname === item.href && (
              <motion.div
                layoutId="sidebar-active-indicator"
                className="absolute inset-0 z-0 bg-primary"
                initial={false}
                style={{ borderRadius: '4px' }}
              />
            )}

            <div className="z-10 grid h-full w-10 shrink-0 place-content-center text-lg">
              <item.icon className="h-5 w-5" strokeWidth={1.5} />
            </div>

            <span className="z-10 whitespace-nowrap pr-4 text-sm font-medium">{item.label}</span>
          </MotionLink>
        ))}
      </div>

      <div className="mt-auto w-full flex justify-center px-1">
        <div className="">
          <ModeToggle />
        </div>
      </div>
    </nav>
  )
}
