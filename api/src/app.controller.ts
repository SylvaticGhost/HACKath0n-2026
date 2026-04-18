import { Controller, Get, Injectable } from '@nestjs/common'
import { Result } from 'shared'

@Injectable()
@Controller()
export class AppController {
  @Get('health')
  healthCheck() {
    return Result.success<string>('Ok')
  }
}
