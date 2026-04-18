import { Controller, Get, Query } from '@nestjs/common'
import type {
  LandRegistryDto,
  LandSearchDto,
  LocationSuggestionDto,
  PaginatedList,
  RealtyRegistryDto,
  RealtySearchDto,
} from 'shared'
import { LandSearchSchema, LocationSuggestionSchema, RealtySearchSchema, Result } from 'shared'
import { ZodValidationPipe } from '../../middleware/zod-validation.pipe'
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

  @Get('land/location-suggestions')
  async suggestLandByLocation(
    @Query(new ZodValidationPipe(LocationSuggestionSchema)) { query, limit }: LocationSuggestionDto,
  ): Promise<Result<LandRegistryDto[]>> {
    const data = await this.registryService.suggestLandByLocation(query, limit)
    return Result.success(data)
  }

  @Get('land/search')
  async searchLand(
    @Query(new ZodValidationPipe(LandSearchSchema)) params: LandSearchDto,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<Result<PaginatedList<LandRegistryDto>>> {
    const paginationResult = parsePaginationQuery(page, pageSize)
    if (paginationResult.isFailure()) {
      return paginationResult.mapFailure<PaginatedList<LandRegistryDto>>()
    }
    const data = await this.registryService.searchLand(
      params,
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

  @Get('realty/location-suggestions')
  async suggestRealtyByLocation(
    @Query(new ZodValidationPipe(LocationSuggestionSchema)) { query, limit }: LocationSuggestionDto,
  ): Promise<Result<RealtyRegistryDto[]>> {
    const data = await this.registryService.suggestRealtyByLocation(query, limit)
    return Result.success(data)
  }

  @Get('realty/search')
  async searchRealty(
    @Query(new ZodValidationPipe(RealtySearchSchema)) params: RealtySearchDto,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<Result<PaginatedList<RealtyRegistryDto>>> {
    const paginationResult = parsePaginationQuery(page, pageSize)
    if (paginationResult.isFailure()) {
      return paginationResult.mapFailure<PaginatedList<RealtyRegistryDto>>()
    }
    const data = await this.registryService.searchRealty(
      params,
      paginationResult.strictValue.page,
      paginationResult.strictValue.pageSize,
    )
    return Result.success(data)
  }
}
