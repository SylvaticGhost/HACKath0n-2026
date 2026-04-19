import { Controller, Get, Query } from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
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
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'cadastralNumber', required: false, type: String })
  @ApiQuery({ name: 'stateTaxId', required: false, type: String })
  @ApiQuery({ name: 'user', required: false, type: String })
  @ApiQuery({ name: 'location', required: false, type: String })
  @ApiQuery({ name: 'squareMin', required: false, type: Number })
  @ApiQuery({ name: 'squareMax', required: false, type: Number })
  @ApiQuery({ name: 'estimateValueMin', required: false, type: Number })
  @ApiQuery({ name: 'estimateValueMax', required: false, type: Number })
  async getLandPaginated(
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

  @Get('land/invalid-count')
  async getLandInvalidCount(): Promise<Result<number>> {
    const count = await this.registryService.getLandInvalidCount()
    return Result.success(count)
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
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'stateTaxId', required: false, type: String })
  @ApiQuery({ name: 'taxpayerName', required: false, type: String })
  @ApiQuery({ name: 'objectAddress', required: false, type: String })
  @ApiQuery({ name: 'totalAreaMin', required: false, type: Number })
  @ApiQuery({ name: 'totalAreaMax', required: false, type: Number })
  @ApiQuery({ name: 'ownershipShareMin', required: false, type: Number })
  @ApiQuery({ name: 'ownershipShareMax', required: false, type: Number })
  async getRealtyPaginated(
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

  @Get('realty/invalid-count')
  async getRealtyInvalidCount(): Promise<Result<number>> {
    const count = await this.registryService.getRealtyInvalidCount()
    return Result.success(count)
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
