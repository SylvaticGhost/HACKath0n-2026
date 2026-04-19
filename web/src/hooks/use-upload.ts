import { useMutation, useQueryClient } from '@tanstack/react-query'

import { fetchApi } from '@/shared/api/client'

export type UploadDataType = 'drrp_land' | 'drrp_real_estate'

export interface UploadStats {
  total: number
  insertedToRegistry: number
  redirectedToCrm: number
  errors: number
  errorDetails: string[]
}

interface UploadFileParams {
  file: File
  dataType: UploadDataType
}

function resolveUploadPath(dataType: UploadDataType) {
  return dataType === 'drrp_land' ? '/upload/land' : '/upload/realty'
}

export function useUploadRegistryFile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ file, dataType }: UploadFileParams) => {
      const formData = new FormData()
      formData.set('file', file)

      return fetchApi<UploadStats>(resolveUploadPath(dataType), {
        method: 'POST',
        body: formData,
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['registry'] })
      void queryClient.invalidateQueries({ queryKey: ['diff'] })
    },
  })
}
