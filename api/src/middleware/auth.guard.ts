import { applyDecorators, UseGuards } from '@nestjs/common'
import { ApiUnauthorizedResponse } from '@nestjs/swagger'
import { UserGuard } from './user.guard'

export function AuthGuard() {
  return applyDecorators(UseGuards(UserGuard), ApiUnauthorizedResponse({ description: 'Unauthorized' }))
}
