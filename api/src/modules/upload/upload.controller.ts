import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger'
import { memoryStorage } from 'multer'
import { UploadService } from './upload.service'

const FILE_FIELD = 'file'
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB
const ALLOWED_MIMETYPES = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/csv',
  'text/plain',
]

const multerOptions = {
  storage: memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req: any, file: Express.Multer.File, cb: Function) => {
    const ext = file.originalname.toLowerCase().split('.').pop() ?? ''
    if (['csv', 'xlsx', 'xls'].includes(ext)) {
      cb(null, true)
    } else {
      cb(new BadRequestException('Only .csv, .xlsx, .xls files are allowed'), false)
    }
  },
}

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('land')
  @ApiOperation({
    summary: 'Upload land records from CSV or Excel',
    description:
      'Parses the file and inserts each record into the general registry. ' +
      'If a record with the same cadastral number already exists in the registry, it is redirected to CRM.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'CSV or Excel (.xlsx/.xls) file' },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(FileInterceptor(FILE_FIELD, multerOptions))
  async uploadLand(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required')
    return this.uploadService.uploadLandFile(file)
  }

  @Post('realty')
  @ApiOperation({
    summary: 'Upload realty records from CSV or Excel',
    description:
      'Parses the file and inserts each record into the general registry. ' +
      'If a record with the same ЄДРПОУ + registration date already exists in the registry, it is redirected to CRM.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'CSV or Excel (.xlsx/.xls) file' },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(FileInterceptor(FILE_FIELD, multerOptions))
  async uploadRealty(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required')
    return this.uploadService.uploadRealtyFile(file)
  }
}
