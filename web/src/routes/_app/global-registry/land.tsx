import { createFileRoute } from '@tanstack/react-router'

import { RegistryPage } from '@/components/registry/registry-page'

export const Route = createFileRoute('/_app/global-registry/land')({
  component: GlobalRegistryLandPage,
})

function GlobalRegistryLandPage() {
  return <RegistryPage scope="Global Registry" entity="Land" />
}
