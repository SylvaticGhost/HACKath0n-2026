import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { typeOrmConfig } from './database/typeorm.config'
import { ConfigModule } from '@nestjs/config'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'
import { AppController } from './app.controller'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { ResultInterceptor } from './middleware/result.interceptor'
import { CrmModule } from './modules/crm/crm.module'
import { RegistryModule } from './modules/registry/registry.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
      exclude: ['/api/{*splat}'],
    }),
    CrmModule,
    RegistryModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResultInterceptor,
    },
  ],
  controllers: [AppController],
})
export class AppModule {}
