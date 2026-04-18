import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/global-registry/land')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_app/global-registry/land"!</div>
}
