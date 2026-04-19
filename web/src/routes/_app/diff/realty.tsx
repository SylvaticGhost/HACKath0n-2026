import { createFileRoute } from '@tanstack/react-router'

import { DiffPage } from '@/components/diff/diff-page'

export const Route = createFileRoute('/_app/diff/realty')({
  component: DiffRealtyPage,
})

function DiffRealtyPage() {
  return <DiffPage entity="Realty" />
}
