import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { RealtyCrm } from './entities/realty.crm.entity'
import { LandCrm } from './entities/land.crm.entity'

@Injectable()
export class CrmService {
  constructor(
    @InjectRepository(RealtyCrm)
    private readonly realtyCrmRepository: Repository<RealtyCrm>,
    @InjectRepository(LandCrm)
    private readonly landCrmRepository: Repository<LandCrm>,
  ) {}

  async clearData(): Promise<void> {
    await Promise.all([this.realtyCrmRepository.clear(), this.landCrmRepository.clear()])
  }
}
