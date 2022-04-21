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
import { AppConfigService } from 'src/config/providers/configuration.service'
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard'
import { LocalAuthGuard } from 'src/shared/guards/local-auth.guard'
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
  async register(@Body() dto: RegisterUserDto) {
    try {
      const res = await this.userService.register(dto)
      return res
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Req() req: RequestLocal,
    @Res({ passthrough: true }) response: Response
  ): Promise<UserDocument> {
    try {
      const token = this.authService.login(req.user)

      response.cookie(this.config.tokenName, token.accessToken)

      return req.user
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getUser(@Req() req: RequestJwt): Promise<UserDocument> {
    try {
      const user = await this.userService.findByEmail(req.user.email)

      if (!user) {
        throw new HttpException(
          'Incorrect email or password',
          HttpStatus.UNPROCESSABLE_ENTITY
        )
      }

      return user
    } catch (error) {
      throw error
    }
  }

  @Get('signout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.cookie(this.config.tokenName, '', { expires: new Date() })
  }
}
