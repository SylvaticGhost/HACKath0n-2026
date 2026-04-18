import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CrmService } from './crm.service'
import { CrmController } from './crm.controller'
import { RealtyCrm } from './entities/realty.crm.entity'
import { LandCrm } from './entities/land.crm.entity'

@Module({
  imports: [TypeOrmModule.forFeature([RealtyCrm, LandCrm])],
  controllers: [CrmController],
  providers: [CrmService],
})
export class CrmModule {}
