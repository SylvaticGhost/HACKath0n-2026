import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import type { LandRegistryDto, PaginatedList, RealtyRegistryDto } from 'shared'
import { EntityManager } from 'typeorm'
import { LandRegistry } from './entities/land.registry.entity'
import { RealtyRegistry } from './entities/realty.registry.entity'

@Injectable()
export class RegistryService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async getLandPaginated(page: number, pageSize: number): Promise<PaginatedList<LandRegistryDto>> {
    const [items, totalItems] = await this.entityManager
      .createQueryBuilder(LandRegistry, 'land')
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

  async getRealtyPaginated(page: number, pageSize: number): Promise<PaginatedList<RealtyRegistryDto>> {
    const [items, totalItems] = await this.entityManager
      .createQueryBuilder(RealtyRegistry, 'realty')
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
