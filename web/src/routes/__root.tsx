import { createRootRoute, Outlet, ScrollRestoration, Link } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { ThemeProvider } from '@/components/theme-provider'
import { NuqsAdapter } from 'nuqs/adapters/tanstack-router'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

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
  const isDev = import.meta.env.DEV
  return (
    <NuqsAdapter>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Outlet />
        <ScrollRestoration />
        {!isDev && (
          <>
            <TanStackRouterDevtools position="bottom-left" />
            <ReactQueryDevtools />
          </>
        )}
      </ThemeProvider>
    </NuqsAdapter>
  )
}
