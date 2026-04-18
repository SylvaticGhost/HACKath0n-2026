import { createFileRoute } from '@tanstack/react-router'

import { RegistryPage } from '@/components/registry/registry-page'

export const Route = createFileRoute('/_app/local-registry/land')({
  component: LocalRegistryLandPage,
})

function LocalRegistryLandPage() {
  return <RegistryPage scope="Local Registry" entity="Land" />
}
