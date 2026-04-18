'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

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
    const next = isDark ? 'light' : 'dark'
    setTheme(next)
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
    // зберігаємо місце, щоб layout не стрибав
    return <div className="h-9 w-9" aria-hidden />
  }

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button type="button" variant="ghost" size="icon" aria-label="Toggle theme" onClick={toggle}>
            {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
        </TooltipTrigger>

        <TooltipContent side="bottom" align="center" className="flex items-center gap-2">
          <span>Toggle Mode</span>
          <span className="ml-1 inline-flex items-center justify-center rounded border bg-muted px-1.5 py-0.5 text-[11px] leading-none text-muted-foreground">
            D
          </span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
