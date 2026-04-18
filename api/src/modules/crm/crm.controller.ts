import { Controller, Delete } from '@nestjs/common'
import { CrmService } from './crm.service'

@Controller('crm')
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Delete('data')
  async clearData(): Promise<void> {
    await this.crmService.clearData()
  }
}
