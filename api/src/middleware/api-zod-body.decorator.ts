import { applyDecorators } from '@nestjs/common'
import { ApiBody, ApiResponse } from '@nestjs/swagger'
import type { ZodTypeAny } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

function toOpenApiSchema(schema: ZodTypeAny) {
  const jsonSchema = zodToJsonSchema(schema as any, {
    target: 'openApi3',
    $refStrategy: 'none',
  }) as any
  const { $schema, definitions, ...rest } = jsonSchema
  if (rest.$ref && definitions) {
    const refName = rest.$ref.split('/').pop()
    return definitions[refName]
  }

  if (!rest.type && rest.properties) {
    rest.type = 'object'
  }

  return rest
}

export function ApiZodBody(schema: ZodTypeAny) {
  return applyDecorators(
    ApiBody({
      schema: toOpenApiSchema(schema),
    }),
  )
}

export function ApiZodOutput(schema: ZodTypeAny, statusCode = 200) {
  return applyDecorators(
    ApiResponse({
      schema: toOpenApiSchema(schema),
      status: statusCode,
    }),
  )
}
