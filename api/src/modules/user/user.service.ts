import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User, UserPayload } from './core/user.entity'
import { UserCreatedDto, UserCreateDto, UserDto, UserLoggedDto, UserLoginDto } from 'shared/contracts'
import { PasswordHelper } from './helpers/password.helper'
import { Guard, Result } from 'shared'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createDto: UserCreateDto): Promise<Result<UserCreatedDto>> {
    if (await this.emailUsed(createDto.email))
      return Result.badRequest(`User with email ${createDto.email} already exists`)

    const username: string = createDto.manuallyDefinedUsername || User.suggestUsername(createDto.email)

    if (await this.usernameUsed(username)) return Result.badRequest(`User with username ${username} already exists`)

    const plainPassword = createDto.password
      ? PasswordHelper.guardPassword(createDto.password)
      : PasswordHelper.generateSecurePassword()
    const hashedPassword = await PasswordHelper.hashPassword(plainPassword)
    const user = User.create(createDto, username, hashedPassword)
    await this.userRepository.save(user)
    const createdDto: UserCreatedDto = user.asCreatedDto(plainPassword)

    return Result.created(createdDto)
  }

  private emailUsed(email: string): Promise<boolean> {
    return this.userRepository.exists({ where: { email } })
  }

  private usernameUsed(username: string): Promise<boolean> {
    return this.userRepository.exists({ where: { username } })
  }

  async login(loginDto: UserLoginDto): Promise<Result<UserLoggedDto>> {
    const user = await this.userRepository.findOne({
      where: { username: loginDto.username },
      relations: ['manualAuth'],
    })
    if (!user) return Result.badRequest(`Invalid username or password`)

    Guard.against.nullOrUndefined(user.manualAuth, `Invalid username or password`)

    const matchPasswords = await PasswordHelper.comparePasswords(loginDto.password, user.manualAuth?.password!)
    if (!matchPasswords) {
      return Result.badRequest(`Invalid username or password`)
    }

    const jwt = this.generateJwtToken(user.asPayload())

    const userLoggedDto = {
      user: user.asDto(),
      jwt,
    }

    return Result.success(userLoggedDto)
  }

  private generateJwtToken(userPayload: UserPayload) {
    return this.jwtService.sign(userPayload)
  }
}
