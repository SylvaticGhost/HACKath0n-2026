import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import type { LandRegistryDto, PaginatedList, RealtyRegistryDto, LandSearchDto, RealtySearchDto } from 'shared'
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

  async searchLand(params: LandSearchDto, page: number, pageSize: number): Promise<PaginatedList<LandRegistryDto>> {
    const query = this.entityManager.createQueryBuilder(LandRegistry, 'land')

    if (params.cadastralNumber) {
      query.andWhere('land.cadastralNumber ILIKE :cadastralNumber', {
        cadastralNumber: `%${params.cadastralNumber}%`,
      })
    }
    if (params.stateTaxId) {
      query.andWhere('land.stateTaxId ILIKE :stateTaxId', { stateTaxId: `%${params.stateTaxId}%` })
    }
    if (params.user) {
      query.andWhere('land.user ILIKE :user', { user: `%${params.user}%` })
    }
    if (params.location) {
      query.andWhere('land.location ILIKE :location', { location: `%${params.location}%` })
    }

    const [items, totalItems] = await query
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

  async searchRealty(
    params: RealtySearchDto,
    page: number,
    pageSize: number,
  ): Promise<PaginatedList<RealtyRegistryDto>> {
    const query = this.entityManager.createQueryBuilder(RealtyRegistry, 'realty')

    if (params.stateTaxId) {
      query.andWhere('realty.stateTaxId ILIKE :stateTaxId', { stateTaxId: `%${params.stateTaxId}%` })
    }
    if (params.taxpayerName) {
      query.andWhere('realty.taxpayerName ILIKE :taxpayerName', {
        taxpayerName: `%${params.taxpayerName}%`,
      })
    }
    if (params.objectAddress) {
      query.andWhere('realty.objectAddress ILIKE :objectAddress', {
        objectAddress: `%${params.objectAddress}%`,
      })
    }

    const [items, totalItems] = await query
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
