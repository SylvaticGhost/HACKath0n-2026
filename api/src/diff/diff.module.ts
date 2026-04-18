import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RegistryModule } from '../modules/registry/registry.module'
import { CrmModule } from '../modules/crm/crm.module'
import { DiffService } from './diff.service'
import { DiffController } from './diff.controller'
import { LandDiffView } from './entities/land-diff.view'
import { RealtyDiffView } from './entities/realty-diff.view'

@Module({
  imports: [TypeOrmModule.forFeature([LandDiffView, RealtyDiffView]), RegistryModule, CrmModule],
  providers: [DiffService],
  controllers: [DiffController],
})
export class DiffModule {}
