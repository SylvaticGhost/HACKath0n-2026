import NavBar from '@/components/NavBar'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_app')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex h-screen">
      <NavBar />
      <main className="flex-1 min-h-0 w-full max-w-screen-xl mx-auto px-4 md:px-8 py-6 flex flex-col">
        <Outlet />
      </main>
    </div>
  )
}
