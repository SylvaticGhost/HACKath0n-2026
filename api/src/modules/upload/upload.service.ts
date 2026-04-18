import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Result } from 'shared'
import * as XLSX from 'xlsx'
import * as csvtojson from 'csvtojson'
import { LandRegistry } from '../registry/entities/land.registry.entity'
import { RealtyRegistry } from '../registry/entities/realty.registry.entity'
import { LandCrm } from '../crm/entities/land.crm.entity'
import { RealtyCrm } from '../crm/entities/realty.crm.entity'

export interface UploadStats {
  total: number
  insertedToRegistry: number
  redirectedToCrm: number
  errors: number
  errorDetails: string[]
}

// Ukrainian → English column name mappings for land records
const LAND_COLUMN_MAP: Record<string, keyof LandRegistry> = {
  'Кадастровий номер': 'cadastralNumber',
  cadastralNumber: 'cadastralNumber',
  КОАТУУ: 'koatuu',
  koatuu: 'koatuu',
  'Форма власності': 'ownershipType',
  ownershipType: 'ownershipType',
  'Цільове призначення': 'intendedPurpose',
  intendedPurpose: 'intendedPurpose',
  Місцерозташування: 'location',
  Адреса: 'location',
  location: 'location',
  'Вид використання': 'landPurposeType',
  landPurposeType: 'landPurposeType',
  'Площа (га)': 'square',
  Площа: 'square',
  square: 'square',
  НГО: 'estimateValue',
  estimateValue: 'estimateValue',
  ЄДРПОУ: 'stateTaxId',
  stateTaxId: 'stateTaxId',
  Власник: 'user',
  user: 'user',
  Частка: 'ownerPart',
  ownerPart: 'ownerPart',
  'Дата державної реєстрації': 'stateRegistrationDate',
  'Дата реєстрації': 'stateRegistrationDate',
  stateRegistrationDate: 'stateRegistrationDate',
  'Номер реєстрації': 'ownershipRegistrationId',
  ownershipRegistrationId: 'ownershipRegistrationId',
  Реєстратор: 'registrator',
  registrator: 'registrator',
  Тип: 'type',
  type: 'type',
  Підтип: 'subtype',
  subtype: 'subtype',
}

// Ukrainian → English column name mappings for realty records
const REALTY_COLUMN_MAP: Record<string, keyof RealtyRegistry> = {
  ЄДРПОУ: 'stateTaxId',
  stateTaxId: 'stateTaxId',
  'Дата реєстрації права': 'ownershipRegistrationDate',
  'Дата реєстрації': 'ownershipRegistrationDate',
  ownershipRegistrationDate: 'ownershipRegistrationDate',
  Платник: 'taxpayerName',
  taxpayerName: 'taxpayerName',
  "Тип об'єкта": 'objectType',
  objectType: 'objectType',
  "Адреса об'єкта": 'objectAddress',
  Адреса: 'objectAddress',
  objectAddress: 'objectAddress',
  'Дата припинення': 'ownershipTerminationDate',
  ownershipTerminationDate: 'ownershipTerminationDate',
  'Загальна площа': 'totalArea',
  Площа: 'totalArea',
  totalArea: 'totalArea',
  'Тип спільної власності': 'jointOwnershipType',
  jointOwnershipType: 'jointOwnershipType',
  Частка: 'ownershipShare',
  ownershipShare: 'ownershipShare',
}

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name)

  constructor(
    @InjectRepository(LandRegistry)
    private readonly landRegistryRepo: Repository<LandRegistry>,
    @InjectRepository(RealtyRegistry)
    private readonly realtyRegistryRepo: Repository<RealtyRegistry>,
    @InjectRepository(LandCrm)
    private readonly landCrmRepo: Repository<LandCrm>,
    @InjectRepository(RealtyCrm)
    private readonly realtyCrmRepo: Repository<RealtyCrm>,
  ) {}

  async uploadLandFile(file: Express.Multer.File): Promise<Result<UploadStats>> {
    try {
      const rows = await this.parseFile(file)
      const stats: UploadStats = {
        total: rows.length,
        insertedToRegistry: 0,
        redirectedToCrm: 0,
        errors: 0,
        errorDetails: [],
      }

      for (const row of rows) {
        try {
          const record = this.mapToLandRecord(row)
          if (!record.cadastralNumber) {
            stats.errors++
            stats.errorDetails.push(`Row missing cadastralNumber: ${JSON.stringify(row)}`)
            continue
          }

          const exists = await this.landRegistryRepo.findOne({ where: { cadastralNumber: record.cadastralNumber } })
          if (exists) {
            await this.landCrmRepo.save(record as unknown as LandCrm)
            stats.redirectedToCrm++
          } else {
            await this.landRegistryRepo.save(record)
            stats.insertedToRegistry++
          }
        } catch (err: any) {
          stats.errors++
          stats.errorDetails.push(err?.message ?? String(err))
          this.logger.error('Error processing land row', err)
        }
      }

      return Result.success(stats)
    } catch (err: any) {
      this.logger.error('Failed to process land file', err)
      return Result.internalError(`Failed to process file: ${err?.message ?? String(err)}`)
    }
  }

  async uploadRealtyFile(file: Express.Multer.File): Promise<Result<UploadStats>> {
    try {
      const rows = await this.parseFile(file)
      const stats: UploadStats = {
        total: rows.length,
        insertedToRegistry: 0,
        redirectedToCrm: 0,
        errors: 0,
        errorDetails: [],
      }

      for (const row of rows) {
        try {
          const record = this.mapToRealtyRecord(row)
          if (!record.stateTaxId || !record.ownershipRegistrationDate) {
            stats.errors++
            stats.errorDetails.push(
              `Row missing required fields (stateTaxId/ownershipRegistrationDate): ${JSON.stringify(row)}`,
            )
            continue
          }

          const exists = await this.realtyRegistryRepo.findOne({
            where: { stateTaxId: record.stateTaxId, ownershipRegistrationDate: record.ownershipRegistrationDate },
          })

          if (exists) {
            await this.realtyCrmRepo.save(record as unknown as RealtyCrm)
            stats.redirectedToCrm++
          } else {
            await this.realtyRegistryRepo.save(record)
            stats.insertedToRegistry++
          }
        } catch (err) {
          stats.errors++
          stats.errorDetails.push(err.message)
          this.logger.error('Error processing realty row', err)
        }
      }

      return Result.success(stats)
    } catch (err) {
      this.logger.error('Failed to process realty file', err)
      return Result.internalError(`Failed to process file: ${err.message}`)
    }
  }

  private async parseFile(file: Express.Multer.File): Promise<Record<string, string>[]> {
    const ext = file.originalname.toLowerCase().split('.').pop()

    if (ext === 'csv') {
      return this.parseCsv(file.buffer)
    } else if (ext === 'xlsx' || ext === 'xls') {
      return this.parseExcel(file.buffer)
    } else {
      throw new Error(`Unsupported file format: .${ext}. Supported formats: .csv, .xlsx, .xls`)
    }
  }

  private async parseCsv(buffer: Buffer): Promise<Record<string, string>[]> {
    return new Promise((resolve, reject) => {
      const converter = (csvtojson as any)({ noheader: false, output: 'json' })
      converter
        .fromString(buffer.toString('utf-8'))
        .then((result: Record<string, string>[]) => resolve(result))
        .catch(reject)
    })
  }

  private parseExcel(buffer: Buffer): Record<string, string>[] {
    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true })
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    return XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: '' })
  }

  private mapToLandRecord(row: Record<string, string>): Partial<LandRegistry> {
    const record: Partial<LandRegistry> = {}
    for (const [col, value] of Object.entries(row)) {
      const field = LAND_COLUMN_MAP[col.trim()]
      if (!field || value === undefined || value === null || value === '') continue

      const strVal = String(value).trim()
      if (['square', 'estimateValue', 'ownerPart'].includes(field)) {
        const num = parseFloat(strVal.replace(',', '.'))
        ;(record as any)[field] = isNaN(num) ? undefined : num
      } else if (field === 'stateRegistrationDate') {
        record.stateRegistrationDate = this.parseDate(strVal)
      } else {
        ;(record as any)[field] = strVal
      }
    }
    return record
  }

  private mapToRealtyRecord(row: Record<string, string>): Partial<RealtyRegistry> {
    const record: Partial<RealtyRegistry> = {}
    for (const [col, value] of Object.entries(row)) {
      const field = REALTY_COLUMN_MAP[col.trim()]
      if (!field || value === undefined || value === null || value === '') continue

      const strVal = String(value).trim()
      if (['totalArea', 'ownershipShare'].includes(field)) {
        const num = parseFloat(strVal.replace(',', '.'))
        ;(record as any)[field] = isNaN(num) ? undefined : num
      } else if (['ownershipRegistrationDate', 'ownershipTerminationDate'].includes(field)) {
        ;(record as any)[field] = this.parseDate(strVal)
      } else {
        ;(record as any)[field] = strVal
      }
    }
    return record
  }

  private parseDate(value: string | Date | undefined): Date | undefined {
    if (!value) return undefined
    // Handle Date objects passed directly from xlsx (cellDates: true)
    if (value instanceof Date) return value
    // Try DD.MM.YYYY
    const dotMatch = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
    if (dotMatch) return new Date(`${dotMatch[3]}-${dotMatch[2]}-${dotMatch[1]}`)
    // Try YYYY-MM-DD
    const isoMatch = value.match(/^\d{4}-\d{2}-\d{2}/)
    if (isoMatch) return new Date(value)
    // Fallback
    const d = new Date(value)
    return isNaN(d.getTime()) ? undefined : d
  }
}
