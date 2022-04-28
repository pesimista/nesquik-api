import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common'
import { Response } from 'express'
import { AppConfigService } from '../../config/providers/configuration.service'
import { AllowAnonymous, JwtAuthGuard } from '../../utils/guards/jwt-auth.guard'
import { LocalAuthGuard } from '../../utils/guards/local-auth.guard'
import { RegisterUserDto } from '../dto/register.dto'
import { AuthService } from '../providers/auth.service'
import { UserService } from '../providers/user.service'
import { UserDocument } from '../schemas/users.schema'
import { RequestJwt, RequestLocal } from '../types/request.type'

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private config: AppConfigService
  ) {}

  @Post('register')
  @UseGuards(JwtAuthGuard)
  async register(
    @Req() req: RequestJwt,
    @Body() dto: RegisterUserDto,
    @Res({ passthrough: true }) response: Response
  ) {
    try {
      const user = await this.userService.register(dto, req.user.id)

      const token = this.authService.createToken(user)
      response.cookie(this.config.tokenName, token.accessToken)
      return user
    } catch (error) {
      // space to add error login to sentry or any other logger service
      throw error
    }
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(
    @Req() req: RequestLocal,
    @Res({ passthrough: true }) response: Response
  ): Promise<UserDocument> {
    const token = this.authService.createToken(req.user)

    response.cookie(this.config.tokenName, token.accessToken)

    return req.user
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @AllowAnonymous()
  async getUser(
    @Req() req: RequestJwt,
    @Res({ passthrough: true }) response: Response
  ): Promise<UserDocument> {
    try {
      let user
      if (req.user) {
        user = await this.userService.findByEmail(req.user.email)
      } else {
        user = await this.userService.createAnonymus()
        const token = this.authService.createToken(user)
        response.cookie(this.config.tokenName, token.accessToken)
      }

      if (!user) {
        throw new HttpException(
          'invalid token',
          HttpStatus.UNPROCESSABLE_ENTITY
        )
      }

      return user
    } catch (error) {
      // space to add error login to sentry or any other logger service
      throw error
    }
  }

  @Get('signout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.cookie(this.config.tokenName, '', { expires: new Date() })
  }
}
