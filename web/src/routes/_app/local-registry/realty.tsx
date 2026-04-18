import { createFileRoute } from '@tanstack/react-router'

import { RegistryPage } from '@/components/registry/registry-page'

export const Route = createFileRoute('/_app/local-registry/realty')({
  component: LocalRegistryRealtyPage,
})

function LocalRegistryRealtyPage() {
  return <RegistryPage scope="Local Registry" entity="Realty" />
}
