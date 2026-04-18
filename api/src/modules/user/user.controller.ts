import { Body, Controller, Injectable, Post } from '@nestjs/common'
import { UserService } from './user.service'
import type { UserCreateDto, UserLoginDto } from 'shared/contracts'
import { ResultUserLoggedSchema, ResultCreatedUserSchema, UserCreateSchema, UserLoginSchema } from 'shared'
import { ApiZodBody, ApiZodOutput } from 'src/middleware/api-zod-body.decorator'

@Injectable()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiZodBody(UserLoginSchema)
  @ApiZodOutput(ResultUserLoggedSchema)
  @Post('login')
  async login(@Body() userLoginDto: UserLoginDto) {
    return await this.userService.login(userLoginDto)
  }

  @ApiZodBody(UserCreateSchema)
  @ApiZodOutput(ResultCreatedUserSchema)
  @Post('create')
  async create(@Body() userCreateDto: UserCreateDto) {
    return await this.userService.create(userCreateDto)
  }
}
