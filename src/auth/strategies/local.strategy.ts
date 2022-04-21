import { Strategy } from 'passport-local'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable } from '@nestjs/common'
import { AuthService } from '../providers/auth.service'
import { UserDocument } from '../schemas/users.schema'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super()
  }

  async validate(username: string, password: string): Promise<UserDocument> {
    const user = await this.authService.validateEmailAndPassword(
      username,
      password
    )

    return user
  }
}
