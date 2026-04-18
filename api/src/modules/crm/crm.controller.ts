import { Controller, Get, Query, Delete } from '@nestjs/common'
import type { LandCrmDto, PaginatedList, RealtyCrmDto } from 'shared'
import { parsePaginationQuery } from '../../utils/pagination-query'
import { CrmService } from './crm.service'
import { Result } from 'shared'

@Controller('crm')
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Get('land')
  async getLandPaginated(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<Result<PaginatedList<LandCrmDto>>> {
    const paginationResult = parsePaginationQuery(page, pageSize)
    if (paginationResult.isFailure()) {
      return paginationResult.mapFailure<PaginatedList<LandCrmDto>>()
    }

    const data = await this.crmService.getLandPaginated(
      paginationResult.strictValue.page,
      paginationResult.strictValue.pageSize,
    )
    return Result.success(data)
  }

  @Get('realty')
  async getRealtyPaginated(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<Result<PaginatedList<RealtyCrmDto>>> {
    const paginationResult = parsePaginationQuery(page, pageSize)
    if (paginationResult.isFailure()) {
      return paginationResult.mapFailure<PaginatedList<RealtyCrmDto>>()
    }

    const data = await this.crmService.getRealtyPaginated(
      paginationResult.strictValue.page,
      paginationResult.strictValue.pageSize,
    )
    return Result.success(data)
  }

  @Delete('data')
  async clearData(): Promise<Result<null>> {
    return this.crmService.clearData()
  }
}
