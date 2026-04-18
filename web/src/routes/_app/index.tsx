import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/')({
  component: AppIndexPage,
})

function AppIndexPage() {
  return <div className="text-foreground">Welcome to the app</div>
}
