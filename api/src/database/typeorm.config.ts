import { DataSourceOptions } from 'typeorm'
import * as dotenv from 'dotenv'
import * as path from 'path'
import { LandCrm } from '../modules/crm/entities/land.crm.entity'
import { RealtyCrm } from '../modules/crm/entities/realty.crm.entity'
import { LandRegistry } from '../modules/registry/entities/land.registry.entity'
import { RealtyRegistry } from '../modules/registry/entities/realty.registry.entity'

const rootPath = path.resolve(__dirname, '../../../../')
const envPath = path.join(rootPath, '.env')
dotenv.config({ path: envPath })

const password = process.env.DB_PASSWORD
if (!password) {
  throw new Error('DB_PASSWORD environment variable is required but not set')
}

const host = process.env.DB_HOST
const sslEnabled = process.env.DB_SSL !== 'false' && host !== 'localhost' && host !== '127.0.0.1'
const rejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'

export const typeOrmConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER,
  password: password,
  database: process.env.DB_NAME,
  entities: [LandCrm, RealtyCrm, LandRegistry, RealtyRegistry],
  synchronize: process.env.DB_SYNC === 'true',
  logging: process.env.NODE_ENV === 'development',
  ssl: sslEnabled ? { rejectUnauthorized } : false,
}
