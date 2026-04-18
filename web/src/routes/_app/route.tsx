import { Header } from '@/components/Header'
import NavBar from '@/components/NavBar'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import Cookies from 'js-cookie'
import type { UserLoggedDto } from 'shared'

export const Route = createFileRoute('/_app')({
  beforeLoad: async () => {
    const session = Cookies.get('session')
    if (!session) throw redirect({ to: '/login', search: { redirect: '/' } })
    return { session: JSON.parse(session) as UserLoggedDto }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { session } = Route.useRouteContext()
  return (
    <>
      <div className="ml-[56px] flex flex-col h-screen">
        <Header user={session.user} />
        <main className="flex-1 min-h-0 w-full max-w-screen-xl mx-auto px-4 md:px-8 py-6 flex flex-col">
          <Outlet />
        </main>
      </div>
      <NavBar />
    </>
  )
}
