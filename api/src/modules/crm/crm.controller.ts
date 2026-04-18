import { Controller, Get, Query } from '@nestjs/common'
import type { LandCrmDto, PaginatedList, RealtyCrmDto } from 'shared'
import { Result } from 'shared'
import { CrmService } from './crm.service'

@Controller('crm')
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Get('land')
  async getLandPaginated(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<Result<PaginatedList<LandCrmDto>>> {
    const parsedPage = Math.max(1, Number.parseInt(page ?? '1', 10) || 1)
    const parsedPageSize = Math.max(1, Number.parseInt(pageSize ?? '10', 10) || 10)
    const data = await this.crmService.getLandPaginated(parsedPage, parsedPageSize)
    return Result.success(data)
  }

  @Get('realty')
  async getRealtyPaginated(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<Result<PaginatedList<RealtyCrmDto>>> {
    const parsedPage = Math.max(1, Number.parseInt(page ?? '1', 10) || 1)
    const parsedPageSize = Math.max(1, Number.parseInt(pageSize ?? '10', 10) || 10)
    const data = await this.crmService.getRealtyPaginated(parsedPage, parsedPageSize)
    return Result.success(data)
  }
}
