import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, In } from 'typeorm'
import { LandDiffView } from './entities/land-diff.view'
import { RealtyDiffView } from './entities/realty-diff.view'
import { PaginatedList } from 'shared'
import { PaginationQuery } from '../utils/pagination-query'

@Injectable()
export class DiffService {
  constructor(
    @InjectRepository(LandDiffView)
    private readonly landDiffRepository: Repository<LandDiffView>,
    @InjectRepository(RealtyDiffView)
    private readonly realtyDiffRepository: Repository<RealtyDiffView>,
  ) {}

  async getLandDiffs(pagination: PaginationQuery): Promise<PaginatedList<LandDiffView>> {
    const [items, totalItems] = await this.landDiffRepository.findAndCount({
      where: {
        diffStatus: In(['CONFLICT', 'MISSING_IN_REGISTRY']),
      },
      skip: (pagination.page - 1) * pagination.pageSize,
      take: pagination.pageSize,
    })

    return {
      items,
      totalItems,
      page: pagination.page,
      pageSize: pagination.pageSize,
    }
  }

  async getRealtyDiffs(pagination: PaginationQuery): Promise<PaginatedList<RealtyDiffView>> {
    const [items, totalItems] = await this.realtyDiffRepository.findAndCount({
      where: {
        diffStatus: In(['CONFLICT', 'MISSING_IN_REGISTRY']),
      },
      skip: (pagination.page - 1) * pagination.pageSize,
      take: pagination.pageSize,
    })

    return {
      items,
      totalItems,
      page: pagination.page,
      pageSize: pagination.pageSize,
    }
  }
}
