import { createFileRoute } from '@tanstack/react-router'

import { DiffPage } from '@/components/diff/diff-page'

export const Route = createFileRoute('/_app/diff/land')({
  component: DiffLandPage,
})

function DiffLandPage() {
  return <DiffPage entity="Land" />
}
