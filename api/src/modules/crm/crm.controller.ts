import { Body, Controller, Delete, Get, Param, Post, Put, Query, Res, UsePipes } from '@nestjs/common'
import { ApiQuery, ApiTags } from '@nestjs/swagger'
import type { Response } from 'express'
import type {
  LandCrmDto,
  LandSearchDto,
  LandTaxViewDto,
  LocationSuggestionDto,
  PaginatedList,
  PropertyInfo,
  RealtyCrmDto,
  RealtySearchDto,
  RealtyTaxViewDto,
  UpdateLandCrmDto,
  UpdateRealtyCrmDto,
} from 'shared'
import {
  LandCrmDtoSchema,
  LandSearchSchema,
  LocationSuggestionSchema,
  PropertyInfoSchema,
  RealtyCrmDtoSchema,
  RealtySearchSchema,
  UpdateLandCrmDtoSchema,
  UpdateRealtyCrmDtoSchema,
} from 'shared'
import { parsePaginationQuery } from '../../utils/pagination-query'
import { CrmService } from './crm.service'
import { Result } from 'shared'
import { ZodValidationPipe } from '../../middleware/zod-validation.pipe'

@ApiTags('crm')
@Controller('crm')
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  // ── Land ──────────────────────────────────────────────────────────────────

  @Get('land')
  @ApiQuery({ name: 'squareMin', required: false, type: Number })
  @ApiQuery({ name: 'squareMax', required: false, type: Number })
  @ApiQuery({ name: 'estimateValueMin', required: false, type: Number })
  @ApiQuery({ name: 'estimateValueMax', required: false, type: Number })
  @ApiQuery({ name: 'validationStatus', required: false, enum: ['VALID', 'INVALID'] })
  async getLandPaginated(
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

  @Get('land/invalid-count')
  async getLandInvalidCount(): Promise<Result<number>> {
    const count = await this.crmService.getLandInvalidCount()
    return Result.success(count)
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

  @Get('land/export')
  @ApiQuery({ name: 'squareMin', required: false, type: Number })
  @ApiQuery({ name: 'squareMax', required: false, type: Number })
  @ApiQuery({ name: 'estimateValueMin', required: false, type: Number })
  @ApiQuery({ name: 'estimateValueMax', required: false, type: Number })
  @ApiQuery({ name: 'validationStatus', required: false, enum: ['VALID', 'INVALID'] })
  async exportLand(
    @Query(new ZodValidationPipe(LandSearchSchema)) params: LandSearchDto,
    @Res() res: Response,
  ): Promise<void> {
    const buffer = await this.crmService.exportLand(params)
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', 'attachment; filename="land.xlsx"')
    res.send(buffer)
  }

  @Get('land/tax')
  async getLandTax(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<Result<PaginatedList<LandTaxViewDto>>> {
    const paginationResult = parsePaginationQuery(page, pageSize)
    if (paginationResult.isFailure()) {
      return paginationResult.mapFailure<PaginatedList<LandTaxViewDto>>()
    }
    const data = await this.crmService.getLandTax(
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

  @Put('land/:cadastralNumber/property-info')
  async upsertLandPropertyInfo(
    @Param('cadastralNumber') cadastralNumber: string,
    @Body(new ZodValidationPipe(PropertyInfoSchema)) info: PropertyInfo,
  ): Promise<Result<null>> {
    return this.crmService.upsertLandPropertyInfo(cadastralNumber, info)
  }

  @Delete('land/:cadastralNumber')
  async deleteLand(@Param('cadastralNumber') cadastralNumber: string): Promise<Result<null>> {
    return this.crmService.deleteLand(cadastralNumber)
  }

  // ── Realty ────────────────────────────────────────────────────────────────

  @Get('realty')
  @ApiQuery({ name: 'totalAreaMin', required: false, type: Number })
  @ApiQuery({ name: 'totalAreaMax', required: false, type: Number })
  @ApiQuery({ name: 'ownershipShareMin', required: false, type: Number })
  @ApiQuery({ name: 'ownershipShareMax', required: false, type: Number })
  @ApiQuery({ name: 'validationStatus', required: false, enum: ['VALID', 'INVALID'] })
  async getRealtyPaginated(
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

  @Get('realty/invalid-count')
  async getRealtyInvalidCount(): Promise<Result<number>> {
    const count = await this.crmService.getRealtyInvalidCount()
    return Result.success(count)
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

  @Get('realty/export')
  @ApiQuery({ name: 'totalAreaMin', required: false, type: Number })
  @ApiQuery({ name: 'totalAreaMax', required: false, type: Number })
  @ApiQuery({ name: 'ownershipShareMin', required: false, type: Number })
  @ApiQuery({ name: 'ownershipShareMax', required: false, type: Number })
  @ApiQuery({ name: 'validationStatus', required: false, enum: ['VALID', 'INVALID'] })
  async exportRealty(
    @Query(new ZodValidationPipe(RealtySearchSchema)) params: RealtySearchDto,
    @Res() res: Response,
  ): Promise<void> {
    const buffer = await this.crmService.exportRealty(params)
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', 'attachment; filename="realty.xlsx"')
    res.send(buffer)
  }

  @Get('realty/tax')
  async getRealtyTax(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<Result<PaginatedList<RealtyTaxViewDto>>> {
    const paginationResult = parsePaginationQuery(page, pageSize)
    if (paginationResult.isFailure()) {
      return paginationResult.mapFailure<PaginatedList<RealtyTaxViewDto>>()
    }
    const data = await this.crmService.getRealtyTax(
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

  @Put('realty/:stateTaxId/:ownershipRegistrationDate/property-info')
  async upsertRealtyPropertyInfo(
    @Param('stateTaxId') stateTaxId: string,
    @Param('ownershipRegistrationDate') ownershipRegistrationDateStr: string,
    @Body(new ZodValidationPipe(PropertyInfoSchema)) info: PropertyInfo,
  ): Promise<Result<null>> {
    const date = new Date(ownershipRegistrationDateStr)
    if (isNaN(date.getTime())) {
      return Result.badRequest<null>('Invalid ownershipRegistrationDate format')
    }
    return this.crmService.upsertRealtyPropertyInfo(stateTaxId, date, info)
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
