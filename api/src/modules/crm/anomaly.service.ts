import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { AnomalyDetailsDto, AnomalyDto, LandCrmDto, PaginatedList, RealtyCrmDto, Result } from 'shared'
import { Anomaly } from './entities/annomaly.entity'
import { LandCrm } from './entities/land.crm.entity'
import { RealtyCrm } from './entities/realty.crm.entity'

@Injectable()
export class AnomalyService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    @InjectRepository(Anomaly)
    private readonly anomalyRepository: Repository<Anomaly>,
    @InjectRepository(LandCrm)
    private readonly landCrmRepository: Repository<LandCrm>,
    @InjectRepository(RealtyCrm)
    private readonly realtyCrmRepository: Repository<RealtyCrm>,
  ) {}

  async createAnomalyReport(): Promise<Result<void>> {
    try {
      await this.entityManager.transaction(async (transactionalEntityManager) => {
        // 1. Delete all records from anomalies table
        await transactionalEntityManager.query('DELETE FROM crm.anomalies')

        // 2. Perform raw SQL query to insert anomalies
        await transactionalEntityManager.query(`
          INSERT INTO crm.anomalies (cadastral_number, land_address, realty_address, match_score, match_reason)
          SELECT
            cadastral_number,
            land_address,
            realty_address,
            match_score,
            match_reason
          FROM crm.v_land_realty_mapping
          WHERE match_reason LIKE '🔴%';
        `)
      })

      return Result.success<void>(undefined)
    } catch (error: unknown) {
      return Result.internalError<void>(error instanceof Error ? error.message : 'Failed to create anomaly report')
    }
  }

  async getAnomaliesPaginated(
    page: number,
    pageSize: number,
    hideResolved?: boolean,
  ): Promise<PaginatedList<AnomalyDto>> {
    const query = this.anomalyRepository.createQueryBuilder('anomaly')

    if (hideResolved) {
      query.where('anomaly.status != :status', { status: 'RESOLVED' })
    }

    const [items, totalItems] = await query
      .orderBy('anomaly.id', 'ASC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount()

    return {
      items: items as AnomalyDto[],
      totalItems,
      page,
      pageSize,
    }
  }

  async resolveAnomaly(id: number): Promise<Result<void>> {
    const anomaly = await this.anomalyRepository.findOne({ where: { id } })

    if (!anomaly) {
      return Result.notFound(`Anomaly with id ${id} not found`)
    }

    if (anomaly.status === 'RESOLVED') {
      return Result.conflict(`Anomaly with id ${id} is already resolved`)
    }

    anomaly.status = 'RESOLVED'
    await this.anomalyRepository.save(anomaly)

    return Result.success<void>(undefined)
  }

  async getAnomalyDetails(id: number): Promise<Result<AnomalyDetailsDto>> {
    const anomaly = await this.anomalyRepository.findOne({ where: { id } })

    if (!anomaly) {
      return Result.notFound<AnomalyDetailsDto>(`Anomaly with id ${id} not found`)
    }

    const land = anomaly.cadastralNumber
      ? await this.landCrmRepository.findOne({
          where: { cadastralNumber: anomaly.cadastralNumber },
        })
      : null

    let realty: RealtyCrm[] = []

    const matchedRealtyAddress = anomaly.realtyAddress?.trim()

    if (matchedRealtyAddress) {
      realty = await this.realtyCrmRepository.find({
        where: { objectAddress: matchedRealtyAddress },
        order: {
          stateTaxId: 'ASC',
          ownershipRegistrationDate: 'ASC',
        },
      })
    }

    return Result.success<AnomalyDetailsDto>({
      anomaly: anomaly as AnomalyDto,
      land: (land as LandCrmDto | null) ?? null,
      realty: realty as RealtyCrmDto[],
    })
  }
}
