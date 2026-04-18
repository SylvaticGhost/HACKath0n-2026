import { Body, Controller, Delete, Get, Param, Post, Put, Query, UsePipes } from '@nestjs/common'
import type {
  LandCrmDto,
  LandSearchDto,
  LocationSuggestionDto,
  PaginatedList,
  RealtyCrmDto,
  RealtySearchDto,
  UpdateLandCrmDto,
  UpdateRealtyCrmDto,
} from 'shared'
import {
  LandCrmDtoSchema,
  LandSearchSchema,
  LocationSuggestionSchema,
  RealtyCrmDtoSchema,
  RealtySearchSchema,
  UpdateLandCrmDtoSchema,
  UpdateRealtyCrmDtoSchema,
} from 'shared'
import { parsePaginationQuery } from '../../utils/pagination-query'
import { CrmService } from './crm.service'
import { Result } from 'shared'
import { ZodValidationPipe } from '../../middleware/zod-validation.pipe'

@Controller('crm')
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  // ── Land ──────────────────────────────────────────────────────────────────

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

  @Get('land/location-suggestions')
  async suggestLandByLocation(
    @Query(new ZodValidationPipe(LocationSuggestionSchema)) { query, limit }: LocationSuggestionDto,
  ): Promise<Result<LandCrmDto[]>> {
    const data = await this.crmService.suggestLandByLocation(query, limit)
    return Result.success(data)
  }

  @Get('land/search')
  async searchLand(
    @Query(new ZodValidationPipe(LandSearchSchema)) params: LandSearchDto,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<Result<PaginatedList<LandCrmDto>>> {
    const paginationResult = parsePaginationQuery(page, pageSize)
    if (paginationResult.isFailure()) {
      return paginationResult.mapFailure<PaginatedList<LandCrmDto>>()
    }
    const data = await this.crmService.searchLand(
      params,
      paginationResult.strictValue.page,
      paginationResult.strictValue.pageSize,
    )
    return Result.success(data)
  }

  @Get('land/:cadastralNumber')
  async getLandById(@Param('cadastralNumber') cadastralNumber: string): Promise<Result<LandCrmDto>> {
    return this.crmService.getLandById(cadastralNumber)
  }

  @Post('land')
  @UsePipes(new ZodValidationPipe(LandCrmDtoSchema))
  async createLand(@Body() dto: LandCrmDto): Promise<Result<LandCrmDto>> {
    return this.crmService.createLand(dto)
  }

  @Put('land/:cadastralNumber')
  async updateLand(
    @Param('cadastralNumber') cadastralNumber: string,
    @Body(new ZodValidationPipe(UpdateLandCrmDtoSchema)) dto: UpdateLandCrmDto,
  ): Promise<Result<LandCrmDto>> {
    return this.crmService.updateLand(cadastralNumber, dto)
  }

  @Delete('land/:cadastralNumber')
  async deleteLand(@Param('cadastralNumber') cadastralNumber: string): Promise<Result<null>> {
    return this.crmService.deleteLand(cadastralNumber)
  }

  // ── Realty ────────────────────────────────────────────────────────────────

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

  @Get('realty/location-suggestions')
  async suggestRealtyByLocation(
    @Query(new ZodValidationPipe(LocationSuggestionSchema)) { query, limit }: LocationSuggestionDto,
  ): Promise<Result<RealtyCrmDto[]>> {
    const data = await this.crmService.suggestRealtyByLocation(query, limit)
    return Result.success(data)
  }

  @Get('realty/search')
  async searchRealty(
    @Query(new ZodValidationPipe(RealtySearchSchema)) params: RealtySearchDto,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<Result<PaginatedList<RealtyCrmDto>>> {
    const paginationResult = parsePaginationQuery(page, pageSize)
    if (paginationResult.isFailure()) {
      return paginationResult.mapFailure<PaginatedList<RealtyCrmDto>>()
    }
    const data = await this.crmService.searchRealty(
      params,
      paginationResult.strictValue.page,
      paginationResult.strictValue.pageSize,
    )
    return Result.success(data)
  }

  @Get('realty/:stateTaxId/:ownershipRegistrationDate')
  async getRealtyById(
    @Param('stateTaxId') stateTaxId: string,
    @Param('ownershipRegistrationDate') ownershipRegistrationDateStr: string,
  ): Promise<Result<RealtyCrmDto>> {
    const date = new Date(ownershipRegistrationDateStr)
    if (isNaN(date.getTime())) {
      return Result.badRequest<RealtyCrmDto>('Invalid ownershipRegistrationDate format')
    }
    return this.crmService.getRealtyById(stateTaxId, date)
  }

  @Post('realty')
  @UsePipes(new ZodValidationPipe(RealtyCrmDtoSchema))
  async createRealty(@Body() dto: RealtyCrmDto): Promise<Result<RealtyCrmDto>> {
    return this.crmService.createRealty(dto)
  }

  @Put('realty/:stateTaxId/:ownershipRegistrationDate')
  async updateRealty(
    @Param('stateTaxId') stateTaxId: string,
    @Param('ownershipRegistrationDate') ownershipRegistrationDateStr: string,
    @Body(new ZodValidationPipe(UpdateRealtyCrmDtoSchema)) dto: UpdateRealtyCrmDto,
  ): Promise<Result<RealtyCrmDto>> {
    const date = new Date(ownershipRegistrationDateStr)
    if (isNaN(date.getTime())) {
      return Result.badRequest<RealtyCrmDto>('Invalid ownershipRegistrationDate format')
    }
    return this.crmService.updateRealty(stateTaxId, date, dto)
  }

  @Delete('realty/:stateTaxId/:ownershipRegistrationDate')
  async deleteRealty(
    @Param('stateTaxId') stateTaxId: string,
    @Param('ownershipRegistrationDate') ownershipRegistrationDateStr: string,
  ): Promise<Result<null>> {
    const date = new Date(ownershipRegistrationDateStr)
    if (isNaN(date.getTime())) {
      return Result.badRequest<null>('Invalid ownershipRegistrationDate format')
    }
    return this.crmService.deleteRealty(stateTaxId, date)
  }

  // ── Utility ───────────────────────────────────────────────────────────────

  @Delete('data')
  async clearData(): Promise<Result<null>> {
    return this.crmService.clearData()
  }
}
