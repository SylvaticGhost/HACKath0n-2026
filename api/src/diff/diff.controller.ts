import { Controller, Get, Query } from '@nestjs/common'
import { Result, PaginatedList } from 'shared'
import { parsePaginationQuery } from '../utils/pagination-query'
import { DiffService } from './diff.service'
import { LandDiffView } from './entities/land-diff.view'
import { RealtyDiffView } from './entities/realty-diff.view'

@Controller('diff')
export class DiffController {
  constructor(private readonly diffService: DiffService) {}

  @Get('land')
  async getLandDiffs(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<Result<PaginatedList<LandDiffView>>> {
    const paginationResult = parsePaginationQuery(page, pageSize)
    if (paginationResult.isFailure()) {
      return paginationResult.mapFailure<PaginatedList<LandDiffView>>()
    }

    const data = await this.diffService.getLandDiffs(paginationResult.strictValue)
    return Result.success(data)
  }

  @Get('realty')
  async getRealtyDiffs(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<Result<PaginatedList<RealtyDiffView>>> {
    const paginationResult = parsePaginationQuery(page, pageSize)
    if (paginationResult.isFailure()) {
      return paginationResult.mapFailure<PaginatedList<RealtyDiffView>>()
    }

    const data = await this.diffService.getRealtyDiffs(paginationResult.strictValue)
    return Result.success(data)
  }
}
