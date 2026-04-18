import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/local-registry/realty')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_app/local-registry/realty"!</div>
}
