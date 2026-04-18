import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import type { LandCrmDto, PaginatedList, RealtyCrmDto } from 'shared'
import { EntityManager } from 'typeorm'
import { LandCrm } from './entities/land.crm.entity'
import { RealtyCrm } from './entities/realty.crm.entity'

@Injectable()
export class CrmService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async getLandPaginated(page: number, pageSize: number): Promise<PaginatedList<LandCrmDto>> {
    const [items, totalItems] = await this.entityManager
      .createQueryBuilder(LandCrm, 'land')
      .orderBy('land.cadastralNumber', 'ASC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount()

    return {
      items,
      totalItems,
      page,
      pageSize,
    }
  }

  async getRealtyPaginated(page: number, pageSize: number): Promise<PaginatedList<RealtyCrmDto>> {
    const [items, totalItems] = await this.entityManager
      .createQueryBuilder(RealtyCrm, 'realty')
      .orderBy('realty.stateTaxId', 'ASC')
      .addOrderBy('realty.ownershipRegistrationDate', 'ASC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount()

    return {
      items,
      totalItems,
      page,
      pageSize,
    }
  }
}
