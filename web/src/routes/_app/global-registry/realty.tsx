import { createFileRoute } from '@tanstack/react-router'

import { RegistryPage } from '@/components/registry/registry-page'

export const Route = createFileRoute('/_app/global-registry/realty')({
  component: GlobalRegistryRealtyPage,
})

function GlobalRegistryRealtyPage() {
  return <RegistryPage scope="Global Registry" entity="Realty" />
}
