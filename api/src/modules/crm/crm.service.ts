import * as XLSX from 'xlsx'
import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import type {
  LandCrmDto,
  LandSearchDto,
  LandTaxViewDto,
  PaginatedList,
  PropertyInfo,
  RealtyCrmDto,
  RealtySearchDto,
  RealtyTaxViewDto,
  UpdateLandCrmDto,
  UpdateRealtyCrmDto,
} from 'shared'
import { EntityManager } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { RealtyCrm } from './entities/realty.crm.entity'
import { LandCrm } from './entities/land.crm.entity'
import { LandTaxView } from './entities/land-tax.view'
import { RealtyTaxView } from './entities/realty-tax.view'
import { Result } from 'shared'

@Injectable()
export class CrmService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    @InjectRepository(RealtyCrm)
    private readonly realtyCrmRepository: Repository<RealtyCrm>,
    @InjectRepository(LandCrm)
    private readonly landCrmRepository: Repository<LandCrm>,
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

  async getLandInvalidCount(): Promise<number> {
    return this.landCrmRepository.count({ where: { validationStatus: 'INVALID' } })
  }

  async suggestLandByLocation(query: string, limit = 10): Promise<LandCrmDto[]> {
    return this.entityManager
      .createQueryBuilder(LandCrm, 'land')
      .where('land.location ILIKE :q', { q: `%${query}%` })
      .orderBy('land.cadastralNumber', 'ASC')
      .take(limit)
      .getMany()
  }

  async suggestRealtyByLocation(query: string, limit = 10): Promise<RealtyCrmDto[]> {
    return this.entityManager
      .createQueryBuilder(RealtyCrm, 'realty')
      .where('realty.objectAddress ILIKE :q', { q: `%${query}%` })
      .orderBy('realty.stateTaxId', 'ASC')
      .take(limit)
      .getMany()
  }

  async searchLand(params: LandSearchDto, page: number, pageSize: number): Promise<PaginatedList<LandCrmDto>> {
    const query = this.entityManager.createQueryBuilder(LandCrm, 'land')

    if (params.cadastralNumber) {
      query.andWhere('land.cadastralNumber ILIKE :cadastralNumber', { cadastralNumber: `%${params.cadastralNumber}%` })
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
    if (params.validationStatus) {
      query.andWhere('land.validationStatus = :validationStatus', { validationStatus: params.validationStatus })
    }

    const [items, totalItems] = await query
      .orderBy('land.cadastralNumber', 'ASC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount()

    return { items, totalItems, page, pageSize }
  }

  async getLandById(cadastralNumber: string): Promise<Result<LandCrmDto>> {
    const item = await this.landCrmRepository.findOne({ where: { cadastralNumber } })
    if (!item) {
      return Result.notFound<LandCrmDto>(`Land with cadastralNumber "${cadastralNumber}" not found`)
    }
    return Result.success<LandCrmDto>(item)
  }

  async createLand(dto: LandCrmDto): Promise<Result<LandCrmDto>> {
    const existing = await this.landCrmRepository.findOne({
      where: { cadastralNumber: dto.cadastralNumber },
    })
    if (existing) {
      return Result.conflict<LandCrmDto>(`Land with cadastralNumber "${dto.cadastralNumber}" already exists`)
    }
    const entity = this.landCrmRepository.create(dto as any)
    const saved = (await this.landCrmRepository.save(entity as any)) as LandCrm
    return Result.created<LandCrmDto>(saved)
  }

  async updateLand(cadastralNumber: string, dto: UpdateLandCrmDto): Promise<Result<LandCrmDto>> {
    const existing = await this.landCrmRepository.findOne({ where: { cadastralNumber } })
    if (!existing) {
      return Result.notFound<LandCrmDto>(`Land with cadastralNumber "${cadastralNumber}" not found`)
    }
    await this.landCrmRepository.update({ cadastralNumber }, dto as any)
    const updated = await this.landCrmRepository.findOne({ where: { cadastralNumber } })
    return Result.success<LandCrmDto>(updated!)
  }

  async deleteLand(cadastralNumber: string): Promise<Result<null>> {
    const existing = await this.landCrmRepository.findOne({ where: { cadastralNumber } })
    if (!existing) {
      return Result.notFound<null>(`Land with cadastralNumber "${cadastralNumber}" not found`)
    }
    await this.landCrmRepository.delete({ cadastralNumber })
    return Result.success<null>(null)
  }

  async getRealtyInvalidCount(): Promise<number> {
    return this.realtyCrmRepository.count({ where: { validationStatus: 'INVALID' } })
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

  async searchRealty(params: RealtySearchDto, page: number, pageSize: number): Promise<PaginatedList<RealtyCrmDto>> {
    const query = this.entityManager.createQueryBuilder(RealtyCrm, 'realty')

    if (params.stateTaxId) {
      query.andWhere('realty.stateTaxId ILIKE :stateTaxId', { stateTaxId: `%${params.stateTaxId}%` })
    }
    if (params.taxpayerName) {
      query.andWhere('realty.taxpayerName ILIKE :taxpayerName', { taxpayerName: `%${params.taxpayerName}%` })
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
    if (params.validationStatus) {
      query.andWhere('realty.validationStatus = :validationStatus', { validationStatus: params.validationStatus })
    }

    const [items, totalItems] = await query
      .orderBy('realty.stateTaxId', 'ASC')
      .addOrderBy('realty.ownershipRegistrationDate', 'ASC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount()

    return { items, totalItems, page, pageSize }
  }

  async getRealtyById(stateTaxId: string, ownershipRegistrationDate: Date): Promise<Result<RealtyCrmDto>> {
    const item = await this.realtyCrmRepository.findOne({
      where: { stateTaxId, ownershipRegistrationDate },
    })
    if (!item) {
      return Result.notFound<RealtyCrmDto>(
        `Realty with stateTaxId "${stateTaxId}" and ownershipRegistrationDate "${ownershipRegistrationDate}" not found`,
      )
    }
    return Result.success<RealtyCrmDto>(item)
  }

  async createRealty(dto: RealtyCrmDto): Promise<Result<RealtyCrmDto>> {
    const existing = await this.realtyCrmRepository.findOne({
      where: {
        stateTaxId: dto.stateTaxId,
        ownershipRegistrationDate: dto.ownershipRegistrationDate,
      },
    })
    if (existing) {
      return Result.conflict<RealtyCrmDto>(
        `Realty with stateTaxId "${dto.stateTaxId}" and ownershipRegistrationDate "${dto.ownershipRegistrationDate}" already exists`,
      )
    }
    const entity = this.realtyCrmRepository.create(dto as any)
    const saved = (await this.realtyCrmRepository.save(entity as any)) as RealtyCrm
    return Result.created<RealtyCrmDto>(saved)
  }

  async updateRealty(
    stateTaxId: string,
    ownershipRegistrationDate: Date,
    dto: UpdateRealtyCrmDto,
  ): Promise<Result<RealtyCrmDto>> {
    const existing = await this.realtyCrmRepository.findOne({
      where: { stateTaxId, ownershipRegistrationDate },
    })
    if (!existing) {
      return Result.notFound<RealtyCrmDto>(
        `Realty with stateTaxId "${stateTaxId}" and ownershipRegistrationDate "${ownershipRegistrationDate}" not found`,
      )
    }
    await this.realtyCrmRepository.update({ stateTaxId, ownershipRegistrationDate }, dto as any)
    const updated = await this.realtyCrmRepository.findOne({
      where: { stateTaxId, ownershipRegistrationDate },
    })
    return Result.success<RealtyCrmDto>(updated!)
  }

  async deleteRealty(stateTaxId: string, ownershipRegistrationDate: Date): Promise<Result<null>> {
    const existing = await this.realtyCrmRepository.findOne({
      where: { stateTaxId, ownershipRegistrationDate },
    })
    if (!existing) {
      return Result.notFound<null>(
        `Realty with stateTaxId "${stateTaxId}" and ownershipRegistrationDate "${ownershipRegistrationDate}" not found`,
      )
    }
    await this.realtyCrmRepository.delete({ stateTaxId, ownershipRegistrationDate })
    return Result.success<null>(null)
  }

  async exportLand(params: LandSearchDto): Promise<Buffer> {
    const query = this.entityManager.createQueryBuilder(LandCrm, 'land')

    if (params.cadastralNumber) {
      query.andWhere('land.cadastralNumber ILIKE :cadastralNumber', { cadastralNumber: `%${params.cadastralNumber}%` })
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
    if (params.validationStatus) {
      query.andWhere('land.validationStatus = :validationStatus', { validationStatus: params.validationStatus })
    }

    const items = await query.orderBy('land.cadastralNumber', 'ASC').getMany()

    const formatDate = (d: Date | string | null | undefined): string => {
      if (!d) return ''
      const date = d instanceof Date ? d : new Date(d)
      if (isNaN(date.getTime())) return String(d)
      const dd = String(date.getDate()).padStart(2, '0')
      const mm = String(date.getMonth() + 1).padStart(2, '0')
      return `${dd}.${mm}.${date.getFullYear()}`
    }

    const rows = items.map((item) => ({
      'Кадастровий номер': item.cadastralNumber,
      КОАТУУ: item.koatuu,
      'Форма власності': item.ownershipType,
      'Цільове призначення': item.intendedPurpose,
      Місцерозташування: item.location,
      'Вид с/г угідь': item.landPurposeType,
      'Площа, га': item.square,
      'Усереднена нормативно грошова оцінка': item.estimateValue,
      'ЄДРПОУ землекористувача': item.stateTaxId,
      Землекористувач: item.user,
      'Частка володіння': item.ownerPart ?? '',
      'Дата державної реєстрації права власності': formatDate(item.stateRegistrationDate),
      'Номер запису про право власності': item.ownershipRegistrationId,
      'Орган, що здійснив державну реєстрацію права власності': item.registrator,
      Тип: item.type,
      Підтип: item.subtype,
    }))

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Земля')
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer
  }

  async exportRealty(params: RealtySearchDto): Promise<Buffer> {
    const query = this.entityManager.createQueryBuilder(RealtyCrm, 'realty')

    if (params.stateTaxId) {
      query.andWhere('realty.stateTaxId ILIKE :stateTaxId', { stateTaxId: `%${params.stateTaxId}%` })
    }
    if (params.taxpayerName) {
      query.andWhere('realty.taxpayerName ILIKE :taxpayerName', { taxpayerName: `%${params.taxpayerName}%` })
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
    if (params.validationStatus) {
      query.andWhere('realty.validationStatus = :validationStatus', { validationStatus: params.validationStatus })
    }

    const items = await query
      .orderBy('realty.stateTaxId', 'ASC')
      .addOrderBy('realty.ownershipRegistrationDate', 'ASC')
      .getMany()

    const formatDate = (d: Date | string | null | undefined): string => {
      if (!d) return ''
      const date = d instanceof Date ? d : new Date(d)
      if (isNaN(date.getTime())) return String(d)
      const dd = String(date.getDate()).padStart(2, '0')
      const mm = String(date.getMonth() + 1).padStart(2, '0')
      return `${dd}.${mm}.${date.getFullYear()}`
    }

    const rows = items.map((item) => ({
      'Податковий номер ПП': item.stateTaxId,
      Платник: item.taxpayerName,
      "Тип об'єкта": item.objectType,
      "Адреса об'єкта": item.objectAddress,
      'Дата реєстрації права': formatDate(item.ownershipRegistrationDate),
      'Дата припинення': formatDate(item.ownershipTerminationDate),
      'Загальна площа': item.totalArea,
      'Тип спільної власності': item.jointOwnershipType ?? '',
      Частка: item.ownershipShare ?? '',
    }))

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Нерухомість')
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer
  }

  async getLandTax(page: number, pageSize: number): Promise<PaginatedList<LandTaxViewDto>> {
    const [items, totalItems] = await this.entityManager
      .createQueryBuilder(LandTaxView, 'tax')
      .orderBy('tax.cadastralNumber', 'ASC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount()
    return { items, totalItems, page, pageSize }
  }

  async getRealtyTax(page: number, pageSize: number): Promise<PaginatedList<RealtyTaxViewDto>> {
    const [items, totalItems] = await this.entityManager
      .createQueryBuilder(RealtyTaxView, 'tax')
      .orderBy('tax.stateTaxId', 'ASC')
      .addOrderBy('tax.ownershipRegistrationDate', 'ASC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount()
    return { items, totalItems, page, pageSize }
  }

  async upsertLandPropertyInfo(cadastralNumber: string, info: PropertyInfo): Promise<Result<null>> {
    const existing = await this.landCrmRepository.findOne({ where: { cadastralNumber } })
    if (!existing) {
      return Result.notFound<null>(`Land with cadastralNumber "${cadastralNumber}" not found`)
    }
    await this.landCrmRepository.update({ cadastralNumber }, { propertyInfo: info })
    return Result.success<null>(null)
  }

  async upsertRealtyPropertyInfo(
    stateTaxId: string,
    ownershipRegistrationDate: Date,
    info: PropertyInfo,
  ): Promise<Result<null>> {
    const existing = await this.realtyCrmRepository.findOne({
      where: { stateTaxId, ownershipRegistrationDate },
    })
    if (!existing) {
      return Result.notFound<null>(
        `Realty with stateTaxId "${stateTaxId}" and ownershipRegistrationDate "${ownershipRegistrationDate}" not found`,
      )
    }
    await this.realtyCrmRepository.update({ stateTaxId, ownershipRegistrationDate }, { propertyInfo: info })
    return Result.success<null>(null)
  }

  async clearData(): Promise<Result<null>> {
    try {
      await this.realtyCrmRepository.manager.transaction(async (entityManager) => {
        await entityManager.getRepository(RealtyCrm).clear()
        await entityManager.getRepository(LandCrm).clear()
      })
      return Result.success<null>(null)
    } catch (error: unknown) {
      return Result.internalError<null>(error instanceof Error ? error.message : 'Failed to clear CRM data')
    }
  }
}
