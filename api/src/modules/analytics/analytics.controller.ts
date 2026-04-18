import { Controller, Get } from '@nestjs/common'
import { Result } from 'shared'
import { AnalyticsService } from './analytics.service'

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  async getAnalytics() {
    const data = await this.analyticsService.getAnalytics()
    return Result.success(data)
  }
}
