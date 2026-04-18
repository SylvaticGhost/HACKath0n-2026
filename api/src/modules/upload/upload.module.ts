import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { LandRegistry } from '../registry/entities/land.registry.entity'
import { RealtyRegistry } from '../registry/entities/realty.registry.entity'
import { LandCrm } from '../crm/entities/land.crm.entity'
import { RealtyCrm } from '../crm/entities/realty.crm.entity'
import { UploadController } from './upload.controller'
import { UploadService } from './upload.service'

@Module({
  imports: [TypeOrmModule.forFeature([LandRegistry, RealtyRegistry, LandCrm, RealtyCrm])],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
