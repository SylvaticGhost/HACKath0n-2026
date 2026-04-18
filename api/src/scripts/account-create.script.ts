import path from 'path'
import * as dotenv from 'dotenv'

const rootEnvPath = path.resolve(process.cwd(), '../.env')
console.log(`Loading environment variables from: ${rootEnvPath}`)
dotenv.config({ path: rootEnvPath })

import { NestFactory } from '@nestjs/core'
import { AppModule } from '../app.module'
import { UserService } from '../modules/user/user.service'
import { parseArgs } from 'util'
import { UserCreateSchema } from 'shared/contracts'
import { Logger } from '@nestjs/common'

async function bootstrap() {
  const logger = new Logger('AccountCreateScript')
  logger.log('Starting creating new account')

  const app = await NestFactory.createApplicationContext(AppModule)
  const options = {
    email: { type: 'string' as const, short: 'e' },
    display_name: { type: 'string' as const, short: 'n' },
    username: { type: 'string' as const, short: 'u' },
    avatar: { type: 'string' as const, short: 'a' },
  }

  // 2. Add the destructuring curly braces { values } here!
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options,
    strict: false,
  })

  const parsed = UserCreateSchema.safeParse(values)

  if (!parsed.success) {
    const errorDetails = parsed.error.issues.map((i) => `${i.path}: ${i.message}`).join(', ')
    logger.fatal(`❌ Passed arguments don't satisfy schema: ${errorDetails}`)
    logger.log('Required params: -e <email> | Optional: -n <name> -u <username> -a <avatar>')
    process.exit(1)
  }
  const dto = parsed.data

  const userService = app.get(UserService)
  const result = await userService.create(dto)

  if (result.isSuccess()) {
    logger.log('Successfully created')
    logger.log(JSON.stringify(result, null, 2))
  } else {
    logger.fatal(`Code: ${result.statusCode}. Error creating account ${result.errorMessage}`)
  }
}

bootstrap().then()
