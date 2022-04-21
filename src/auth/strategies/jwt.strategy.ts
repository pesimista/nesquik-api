import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import {
  ExtractJwt,
  JwtFromRequestFunction,
  Strategy,
  StrategyOptions,
} from 'passport-jwt'
import { AppConfigService } from 'src/config/providers/configuration.service'
import { JwtPayload } from '../types/jwt.types'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private config: AppConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategy.extractJWT(config.tokenName),
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.jwt.secret,
    } as StrategyOptions)
  }

  private static extractJWT(cookie: string): JwtFromRequestFunction {
    return (request: Request) => {
      if (request.cookies && request.cookies[cookie]) {
        return request.cookies[cookie]
      }

      return null
    }
  }

  validate(payload: JwtPayload): Partial<JwtPayload> {
    return { id: payload.sub, email: payload.email }
  }
}
