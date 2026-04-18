import { createLink, useRouterState } from '@tanstack/react-router'
import React from 'react'
import { twMerge } from 'tailwind-merge'
import { Upload, PencilLine, ListOrdered, Menu } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const MotionAnchor = React.forwardRef<HTMLAnchorElement, React.ComponentProps<typeof motion.a>>((props, ref) => (
  <motion.a ref={ref} {...props} />
))
const MotionLink = createLink(MotionAnchor)

const menuItems = [
  { label: 'Page 1', href: '/page-1', icon: ListOrdered },
  { label: 'Page 2', href: '/page-2', icon: Upload },
  { label: 'Page 3', href: '/page-3', icon: PencilLine },
]

export default function NavBar() {
  const [isOpen, setOpen] = React.useState(false)
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 backdrop-blur-xs"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.nav
        layout
        className="fixed top-0 z-100 left-0 h-screen shrink-0 border-r border-sidebar-border bg-sidebar p-2 flex flex-col items-start gap-4 pb-3"
        style={{ width: isOpen ? '190px' : 'fit-content' }}
        onClick={() => setOpen((p) => !p)}
      >
        <div className="flex items-center gap-2">
          <motion.button
            layout
            title="Sidebar"
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
          </motion.button>
          <AnimatePresence mode="popLayout">
            {isOpen && (
              <motion.span
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -6, transition: { duration: 0.15 } }}
                transition={{ delay: 0.125, type: 'tween', ease: 'easeOut' }}
                layout
                className="tracking-tighter font-semibold text-lg text-muted-foreground brightness-125"
              >
                Nest+React app
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-1 w-full">
          {menuItems.map((item) => (
            <MotionLink
              key={item.href}
              layout
              to={item.href}
              onClick={(e) => e.stopPropagation()}
              className={twMerge(
                'relative flex h-10 w-full items-center transition-colors rounded-[4px]',
                pathname === item.href
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
              title={item.label}
            >
              {/* floating bg */}
              {pathname === item.href && (
                <motion.div
                  layoutId="sidebar-active-indicator" //? framer-motion treat this element as the same between renders, so it will animate between positions
                  className="absolute inset-0 z-0 bg-primary"
                  initial={false}
                  style={{ borderRadius: '4px' }}
                  // transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}

              {/* icon */}
              <motion.div layout className="z-10 grid h-full w-10 shrink-0 place-content-center text-lg">
                <item.icon className="h-5 w-5" strokeWidth={1.5} />
              </motion.div>

              {/* label */}
              <AnimatePresence mode="popLayout">
                {isOpen && (
                  <motion.span
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -12, transition: { duration: 0.2 } }}
                    transition={{ delay: 0.125, type: 'tween', ease: 'easeOut' }}
                    className="z-10 will-change-transform whitespace-nowrap pr-4 text-sm font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </MotionLink>
          ))}
        </div>
      </motion.nav>
    </>
  )
}
