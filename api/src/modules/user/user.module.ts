import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserService } from './user.service'
import { PassportModule } from '@nestjs/passport'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { User } from './core/user.entity'
import { UserManualAuth } from './core/user-manual-auth.entity'
import { JwtModule } from '@nestjs/jwt'
import { UserController } from './user.controller'
import { JwtStrategy } from './auth-strategies/jwt.strategy'
import { JWT_EXPIRES_IN_HOURS } from 'shared'

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserManualAuth]),
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: `${JWT_EXPIRES_IN_HOURS}h` },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UserController],
  providers: [UserService, JwtStrategy],
  exports: [UserService],
})
export class UserModule {}
