import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CrmService } from './crm.service'
import { CrmController } from './crm.controller'
import { RealtyCrm } from './entities/realty.crm.entity'
import { LandCrm } from './entities/land.crm.entity'
import { LandTaxView } from './entities/land-tax.view'
import { RealtyTaxView } from './entities/realty-tax.view'

@Module({
  imports: [TypeOrmModule.forFeature([RealtyCrm, LandCrm, LandTaxView, RealtyTaxView])],
  controllers: [CrmController],
  providers: [CrmService],
})
export class CrmModule {}
