import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { UserService } from 'src/modules/user/user.service'

@Injectable()
export class UserGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(private readonly userService: UserService) {
    super()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context)
    const request = context.switchToHttp().getRequest()
    const reqUser = request.user
    if (!reqUser || !reqUser.id) throw new UnauthorizedException()
    return true
  }
}
