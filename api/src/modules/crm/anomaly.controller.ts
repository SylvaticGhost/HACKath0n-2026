import { Controller, Get, Param, Post, Put, Query } from '@nestjs/common'
import { AnomalyDto, PaginatedList, Result } from 'shared'
import { parsePaginationQuery } from '../../utils/pagination-query'
import { AnomalyService } from './anomaly.service'

@Controller('crm/anomaly')
export class AnomalyController {
  constructor(private readonly anomalyService: AnomalyService) {}

  @Get()
  async getAnomaliesPaginated(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('hide_resolved') hideResolved?: string,
  ): Promise<Result<PaginatedList<AnomalyDto>>> {
    const paginationResult = parsePaginationQuery(page, pageSize)
    if (paginationResult.isFailure()) {
      return paginationResult.mapFailure<PaginatedList<AnomalyDto>>()
    }

    const data = await this.anomalyService.getAnomaliesPaginated(
      paginationResult.strictValue.page,
      paginationResult.strictValue.pageSize,
      hideResolved === 'true',
    )
    return Result.success(data)
  }

  @Post('generate')
  async generateAnomalyReport(): Promise<Result<void>> {
    return this.anomalyService.createAnomalyReport()
  }

  @Put(':id/resolve')
  async resolveAnomaly(@Param('id') id: string): Promise<Result<void>> {
    return this.anomalyService.resolveAnomaly(Number(id))
  }
}
