import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import type { LandRegistryDto, LandSearchDto, PaginatedList, RealtyRegistryDto, RealtySearchDto } from 'shared'
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

  async getLandInvalidCount(): Promise<number> {
    return this.entityManager
      .createQueryBuilder(LandRegistry, 'land')
      .where(
        `
        land.square IS NULL
        OR land.estimateValue IS NULL
        OR land.stateRegistrationDate IS NULL
        OR NULLIF(TRIM(land.cadastralNumber), '') IS NULL
        OR NULLIF(TRIM(land.koatuu), '') IS NULL
        OR NULLIF(TRIM(land.ownershipType), '') IS NULL
        OR NULLIF(TRIM(land.intendedPurpose), '') IS NULL
        OR NULLIF(TRIM(land.location), '') IS NULL
        OR NULLIF(TRIM(land.landPurposeType), '') IS NULL
        OR NULLIF(TRIM(land.stateTaxId), '') IS NULL
        OR NULLIF(TRIM(land.user), '') IS NULL
        OR NULLIF(TRIM(land.ownershipRegistrationId), '') IS NULL
        OR NULLIF(TRIM(land.registrator), '') IS NULL
        OR NULLIF(TRIM(land.type), '') IS NULL
        `,
      )
      .getCount()
  }

  async suggestLandByLocation(query: string, limit = 10): Promise<LandRegistryDto[]> {
    return this.entityManager
      .createQueryBuilder(LandRegistry, 'land')
      .where('land.location ILIKE :q', { q: `%${query}%` })
      .orderBy('land.cadastralNumber', 'ASC')
      .take(limit)
      .getMany()
  }

  async suggestRealtyByLocation(query: string, limit = 10): Promise<RealtyRegistryDto[]> {
    return this.entityManager
      .createQueryBuilder(RealtyRegistry, 'realty')
      .where('realty.objectAddress ILIKE :q', { q: `%${query}%` })
      .orderBy('realty.stateTaxId', 'ASC')
      .take(limit)
      .getMany()
  }

  async findRealtyByLocationExact(objectAddress: string): Promise<RealtyRegistryDto[]> {
    return this.entityManager
      .createQueryBuilder(RealtyRegistry, 'realty')
      .where('realty.objectAddress = :objectAddress', { objectAddress })
      .orderBy('realty.stateTaxId', 'ASC')
      .addOrderBy('realty.ownershipRegistrationDate', 'ASC')
      .getMany()
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
    if (params.squareMin !== undefined) {
      query.andWhere('land.square >= :squareMin', { squareMin: params.squareMin })
    }
    if (params.squareMax !== undefined) {
      query.andWhere('land.square <= :squareMax', { squareMax: params.squareMax })
    }
    if (params.estimateValueMin !== undefined) {
      query.andWhere('land.estimateValue >= :estimateValueMin', { estimateValueMin: params.estimateValueMin })
    }
    if (params.estimateValueMax !== undefined) {
      query.andWhere('land.estimateValue <= :estimateValueMax', { estimateValueMax: params.estimateValueMax })
    }

    const [items, totalItems] = await query
      .orderBy('land.cadastralNumber', 'ASC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount()

    return { items, totalItems, page, pageSize }
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

  async getRealtyInvalidCount(): Promise<number> {
    return this.entityManager
      .createQueryBuilder(RealtyRegistry, 'realty')
      .where(
        `
        realty.ownershipRegistrationDate IS NULL
        OR realty.totalArea IS NULL
        OR NULLIF(TRIM(realty.stateTaxId), '') IS NULL
        OR NULLIF(TRIM(realty.taxpayerName), '') IS NULL
        OR NULLIF(TRIM(realty.objectType), '') IS NULL
        OR NULLIF(TRIM(realty.objectAddress), '') IS NULL
        `,
      )
      .getCount()
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
      query.andWhere('realty.objectAddress ILIKE :objectAddress', { objectAddress: `%${params.objectAddress}%` })
    }
    if (params.totalAreaMin !== undefined) {
      query.andWhere('realty.totalArea >= :totalAreaMin', { totalAreaMin: params.totalAreaMin })
    }
    if (params.totalAreaMax !== undefined) {
      query.andWhere('realty.totalArea <= :totalAreaMax', { totalAreaMax: params.totalAreaMax })
    }
    if (params.ownershipShareMin !== undefined) {
      query.andWhere('realty.ownershipShare >= :ownershipShareMin', { ownershipShareMin: params.ownershipShareMin })
    }
    if (params.ownershipShareMax !== undefined) {
      query.andWhere('realty.ownershipShare <= :ownershipShareMax', { ownershipShareMax: params.ownershipShareMax })
    }

    const [items, totalItems] = await query
      .orderBy('realty.stateTaxId', 'ASC')
      .addOrderBy('realty.ownershipRegistrationDate', 'ASC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount()

    return { items, totalItems, page, pageSize }
  }
}
