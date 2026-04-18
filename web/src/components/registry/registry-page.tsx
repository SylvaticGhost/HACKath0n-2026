import { Building2, Database, Globe2, MapPinned } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type RegistryScope = 'Global Registry' | 'Local Registry'
type RegistryEntity = 'Land' | 'Realty'

interface RegistryPageProps {
  scope: RegistryScope
  entity: RegistryEntity
}

export function RegistryPage({ scope, entity }: RegistryPageProps) {
  const ScopeIcon = scope === 'Global Registry' ? Globe2 : Database
  const EntityIcon = entity === 'Land' ? MapPinned : Building2

  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col justify-center">
      <Card>
        <CardHeader>
          <div className="mb-4 flex items-center gap-2">
            <Badge variant="secondary">
              <ScopeIcon className="size-3" />
              {scope}
            </Badge>
            <Badge variant="outline">
              <EntityIcon className="size-3" />
              {entity}
            </Badge>
          </div>

          <CardTitle className="text-2xl">
            {scope}: {entity}
          </CardTitle>
          <CardDescription>
            This page is ready for integration with the corresponding API contracts and table views.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>The navigation structure is now connected to this route through the new sidebar dropdown hierarchy.</p>
          <p>
            Next step: bind list/filter actions to backend endpoints for {scope.toLowerCase()} {entity.toLowerCase()}{' '}
            records.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
