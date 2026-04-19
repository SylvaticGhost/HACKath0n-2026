import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CrmService } from './crm.service'
import { CrmController } from './crm.controller'
import { RealtyCrm } from './entities/realty.crm.entity'
import { LandCrm } from './entities/land.crm.entity'
import { Anomaly } from './entities/annomaly.entity'
import { AnomalyService } from './anomaly.service'
import { AnomalyController } from './anomaly.controller'
import { LandTaxView } from './entities/land-tax.view'
import { RealtyTaxView } from './entities/realty-tax.view'

@Module({
  imports: [TypeOrmModule.forFeature([RealtyCrm, LandCrm, LandTaxView, RealtyTaxView, Anomaly])],
  controllers: [CrmController, AnomalyController],
  providers: [CrmService, AnomalyService],

export class CrmModule {}
