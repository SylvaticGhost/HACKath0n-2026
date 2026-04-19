import { createFileRoute } from '@tanstack/react-router'
import { AnomaliesPage } from '@/components/anomalies/anomalies-page'

export const Route = createFileRoute('/_app/anomalies')({
  component: AnomaliesRoute,
})

function AnomaliesRoute() {
  return <AnomaliesPage />
}
