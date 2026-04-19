import { createRootRoute, Outlet, ScrollRestoration, Link } from '@tanstack/react-router'
import { ThemeProvider } from '@/components/theme-provider'
import { NuqsAdapter } from 'nuqs/adapters/tanstack-router'

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col items-center justify-center p-10 text-center bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-2">404 - Page not found</h1>
      <p className="text-muted-foreground mb-4">Sorry, the page you are looking for does not exist.</p>
      <Link to="/" className="text-primary hover:underline font-medium">
        Go to Main
      </Link>
    </div>
  ),
})

function RootComponent() {
  return (
    <NuqsAdapter>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Outlet />
        <ScrollRestoration />
      </ThemeProvider>
    </NuqsAdapter>
  )
}
