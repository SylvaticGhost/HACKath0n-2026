import * as React from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { motion } from 'framer-motion'

function isTypingInInput(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable || tag === 'SELECT'
}

export function ModeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  const effectiveTheme =
    theme === 'system' ? (resolvedTheme as 'light' | 'dark' | undefined) : (theme as 'light' | 'dark' | undefined)

  const isDark = effectiveTheme === 'dark'

  const toggle = React.useCallback(() => {
    setTheme(isDark ? 'light' : 'dark')
  }, [isDark, setTheme])

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return
      if (isTypingInInput(e.target)) return
      if (e.repeat) return
      if (e.key.toLowerCase() === 'd') {
        e.preventDefault()
        toggle()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [toggle])

  if (!mounted) {
    return <div className="h-8 w-16 rounded-full" aria-hidden />
  }

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={toggle}
      className="relative flex h-8 w-16 items-center rounded-full border border-border bg-muted p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* sliding thumb */}
      <motion.div
        className="absolute h-6 w-6 rounded-full bg-background shadow-sm flex items-center justify-center"
        animate={{ x: isDark ? 32 : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        {isDark ? <Moon className="h-3.5 w-3.5 text-foreground" /> : <Sun className="h-3.5 w-3.5 text-foreground" />}
      </motion.div>

      {/* background icons */}
      <Sun className="h-3.5 w-3.5 text-muted-foreground ml-0.5 shrink-0" />
      <Moon className="h-3.5 w-3.5 text-muted-foreground ml-auto mr-0.5 shrink-0" />
    </button>
  )
}
