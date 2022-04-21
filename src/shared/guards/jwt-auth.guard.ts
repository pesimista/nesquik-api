import { ExecutionContext, Injectable, SetMetadata } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import { Request } from 'express'
import { Observable } from 'rxjs'
import { AppConfigService } from 'src/config/providers/configuration.service'

export const ALLOW_ANONYMOUS_META_KEY = 'allowAnonymous'
export const AllowAnonymous = () => SetMetadata(ALLOW_ANONYMOUS_META_KEY, true)

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private config: AppConfigService, private reflector: Reflector) {
    super()
  }

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Handle anonymous access
    const isAnonymousAllowed = this.reflector.getAllAndOverride<boolean>(
      ALLOW_ANONYMOUS_META_KEY,
      [context.getHandler(), context.getClass()]
    )

    const { cookies } = context.switchToHttp().getRequest<Request>()

    if (!isAnonymousAllowed || cookies[this.config.tokenName]) {
      return super.canActivate(context)
    }

    return true
  }
}
