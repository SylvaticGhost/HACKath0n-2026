import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import type { LandCrmDto, PaginatedList, RealtyCrmDto, UpdateLandCrmDto, UpdateRealtyCrmDto } from 'shared'
import { EntityManager } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { RealtyCrm } from './entities/realty.crm.entity'
import { LandCrm } from './entities/land.crm.entity'
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
