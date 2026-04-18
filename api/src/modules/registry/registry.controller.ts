import { Controller, Get, Query } from '@nestjs/common'
import type { LandRegistryDto, PaginatedList, RealtyRegistryDto } from 'shared'
import { Result } from 'shared'
import { RegistryService } from './registry.service'

@Controller('registry')
export class RegistryController {
  constructor(private readonly registryService: RegistryService) {}

  @Get('land')
  async getLandPaginated(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<Result<PaginatedList<LandRegistryDto>>> {
    const parsedPage = Math.max(1, Number.parseInt(page ?? '1', 10) || 1)
    const parsedPageSize = Math.max(1, Number.parseInt(pageSize ?? '10', 10) || 10)
    const data = await this.registryService.getLandPaginated(parsedPage, parsedPageSize)
    return Result.success(data)
  }

  @Get('realty')
  async getRealtyPaginated(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<Result<PaginatedList<RealtyRegistryDto>>> {
    const parsedPage = Math.max(1, Number.parseInt(page ?? '1', 10) || 1)
    const parsedPageSize = Math.max(1, Number.parseInt(pageSize ?? '10', 10) || 10)
    const data = await this.registryService.getRealtyPaginated(parsedPage, parsedPageSize)
    return Result.success(data)
  }
}
