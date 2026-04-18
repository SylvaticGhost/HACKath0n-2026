import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import type { LandCrmDto, PaginatedList, RealtyCrmDto } from 'shared'
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
