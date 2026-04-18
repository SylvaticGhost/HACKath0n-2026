import 'reflect-metadata'
import * as dotenv from 'dotenv'
import * as path from 'path'

const rootPath = path.resolve(__dirname, '../../')
const envPath = path.join(rootPath, '.env')
console.log('Loading environment variables from:', envPath)
dotenv.config({ path: envPath })

import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ExpressAdapter } from '@nestjs/platform-express'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter())
  app.setGlobalPrefix('api')
  const port = process.env.PORT || 3000
  const webClientUrl = process.env.WEB_CLIENT_URL || 'http://localhost:5173'

  app.enableCors({
    origin: webClientUrl,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })

  const config = new DocumentBuilder()
    .setTitle('Nest+React app API')
    .setDescription('OpenAPI documentation for the Nest+React app API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)

  await app.listen(process.env.PORT ?? 3000)
}

bootstrap()
