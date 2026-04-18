import { Controller, Delete } from '@nestjs/common'
import { CrmService } from './crm.service'
import { Result } from 'shared'

@Controller('crm')
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Delete('data')
  async clearData(): Promise<Result<null>> {
    return this.crmService.clearData()
  }
}
