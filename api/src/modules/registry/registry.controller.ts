import { Controller, Get, Query } from '@nestjs/common'
import type { LandRegistryDto, PaginatedList, RealtyRegistryDto } from 'shared'
import { Result } from 'shared'
import { parsePaginationQuery } from '../../utils/pagination-query'
import { RegistryService } from './registry.service'

@Controller('registry')
export class RegistryController {
  constructor(private readonly registryService: RegistryService) {}

  @Get('land')
  async getLandPaginated(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<Result<PaginatedList<LandRegistryDto>>> {
    const paginationResult = parsePaginationQuery(page, pageSize)
    if (paginationResult.isFailure()) {
      return paginationResult.mapFailure<PaginatedList<LandRegistryDto>>()
    }

    const data = await this.registryService.getLandPaginated(
      paginationResult.strictValue.page,
      paginationResult.strictValue.pageSize,
    )
    return Result.success(data)
  }

  @Get('realty')
  async getRealtyPaginated(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<Result<PaginatedList<RealtyRegistryDto>>> {
    const paginationResult = parsePaginationQuery(page, pageSize)
    if (paginationResult.isFailure()) {
      return paginationResult.mapFailure<PaginatedList<RealtyRegistryDto>>()
    }

    const data = await this.registryService.getRealtyPaginated(
      paginationResult.strictValue.page,
      paginationResult.strictValue.pageSize,
    )
    return Result.success(data)
  }
}
