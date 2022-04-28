import { HttpException, HttpStatus, ValidationPipe } from '@nestjs/common'
import { NestApplication } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'
import * as cookieParser from 'cookie-parser'
import * as request from 'supertest'
import { AppConfigService } from '../../config/providers/configuration.service'
import { RegisterUserDto } from '../dto/register.dto'
import { AuthService } from '../providers/auth.service'
import { UserService } from '../providers/user.service'
import { JwtStrategy } from '../strategies/jwt.strategy'
import { LocalStrategy } from '../strategies/local.strategy'
import { AuthController } from './auth.controller'

describe('AuthController (e2e)', () => {
  let controller: AuthController
  let app: NestApplication
  let authMock: AuthService

  let accessToken = ''

  const UserServiceMock = {
    createAnonymus: jest.fn(),
    findByEmail: jest.fn(),
    register: jest.fn(),
  }

  const AppConfigServiceMock = {
    tokenName: 'nesquik',
    jwt: { secret: 'secret' },
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'secret',
          signOptions: { expiresIn: '1m' },
        }),
      ],
      controllers: [AuthController],
      providers: [
        JwtStrategy,
        LocalStrategy,
        AuthService,
        { provide: UserService, useValue: UserServiceMock },
        { provide: AppConfigService, useValue: AppConfigServiceMock },
      ],
    }).compile()

    controller = module.get<AuthController>(AuthController)
    authMock = module.get<AuthService>(AuthService)

    app = module.createNestApplication()

    app.use(cookieParser())
    app.useGlobalPipes(new ValidationPipe())

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('#GET /auth/profile', () => {
    it('should return an newly created anonymous user token', async () => {
      const userMock = {
        id: 'someid',
        email: 'random@nesquik.com',
        isAnonymous: true,
      }

      UserServiceMock.createAnonymus.mockResolvedValue(userMock)
      const createTokenSpy = jest.spyOn(authMock, 'createToken')

      const res = await request(app.getHttpServer()).get('/auth/profile')
      // .set('Cookie', [])

      expect(res.headers['set-cookie'][0]).toContain(
        `${AppConfigServiceMock.tokenName}=${accessToken}`
      )
      expect(res.body).toEqual(userMock)
      expect(res.statusCode).toBe(200)

      accessToken = res.headers['set-cookie'][0]

      expect(UserServiceMock.findByEmail).not.toHaveBeenCalled()
      expect(UserServiceMock.createAnonymus).toHaveBeenCalled()
      expect(createTokenSpy).toHaveBeenCalled()
    })

    it('should return an user token without creating new ones', async () => {
      const userMock = {
        id: 'someid',
        email: 'random@nesquik.com',
        isAnonymous: true,
      }

      UserServiceMock.findByEmail.mockResolvedValue(userMock)
      const createTokenSpy = jest.spyOn(authMock, 'createToken')

      const res = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Cookie', [accessToken])

      expect(res.body).toEqual(userMock)
      expect(res.statusCode).toBe(200)

      expect(UserServiceMock.findByEmail).toHaveBeenCalledWith(userMock.email)
      expect(UserServiceMock.createAnonymus).not.toHaveBeenCalled()
      expect(createTokenSpy).not.toHaveBeenCalled()
    })

    it('should throw an error if the user is not found on the database', async () => {
      UserServiceMock.findByEmail.mockResolvedValue(null)
      const createTokenSpy = jest.spyOn(authMock, 'createToken')

      const res = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Cookie', [accessToken])

      expect(res.statusCode).toBe(422)
      expect(res.body).toHaveProperty('statusCode', 422)
      expect(res.body).toHaveProperty('message', 'invalid token')

      expect(UserServiceMock.findByEmail).toHaveBeenCalledWith(
        'random@nesquik.com'
      )
      expect(UserServiceMock.createAnonymus).not.toHaveBeenCalled()
      expect(createTokenSpy).not.toHaveBeenCalled()
    })
  })

  describe('#POST /auth/register', () => {
    it('should throw an error if register fails', async () => {
      const userDTO: RegisterUserDto = {
        email: 'registered@mail.com',
        name: 'Texas',
        password: 'secretpassword',
        lastName: 'Red',
      }

      UserServiceMock.register.mockRejectedValue(
        new HttpException('Email already taken', HttpStatus.CONFLICT)
      )
      const createSpy = jest.spyOn(authMock, 'createToken')

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .set('Cookie', [accessToken])
        .send(userDTO)

      expect(res.statusCode).toBe(409)
      expect(res.body).toHaveProperty('statusCode', 409)
      expect(res.body).toHaveProperty('message', 'Email already taken')

      expect(UserServiceMock.register).toHaveBeenCalledWith(userDTO, 'someid')
      expect(createSpy).not.toHaveBeenCalled()
    })

    it('should update an anonymous user to be non-anonymous', async () => {
      const userDTO: RegisterUserDto = {
        email: 'registered@mail.com',
        name: 'Texas',
        password: 'secretpassword',
        lastName: 'Red',
      }
      const registeredMock = {
        ...userDTO,
        id: 'someid',
        isAnonymous: false,
      }

      UserServiceMock.register.mockResolvedValue(registeredMock)
      const createSpy = jest.spyOn(authMock, 'createToken')

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .set('Cookie', [accessToken])
        .send(userDTO)

      expect(res.headers['set-cookie'][0]).toContain(
        `${AppConfigServiceMock.tokenName}=`
      )
      expect(res.body).toEqual(registeredMock)
      expect(res.statusCode).toBe(201)

      expect(UserServiceMock.register).toHaveBeenCalledWith(userDTO, 'someid')
      expect(createSpy).toHaveBeenCalledWith(registeredMock)

      accessToken = res.headers['set-cookie'][0]
    })
  })

  describe('#POST /auth/login', () => {
    it('should throw throw an error if the password mismatch', async () => {
      const loginInfo = {
        username: 'registered@mail.com',
        password: 'secretpassword',
      }

      const validateMock = jest.spyOn(authMock, 'validateEmailAndPassword')
      const findSpy = UserServiceMock.findByEmail.mockResolvedValue(null)

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginInfo)

      expect(res.statusCode).toBe(422)
      expect(res.body).toHaveProperty('statusCode', 422)
      expect(res.body).toHaveProperty('message', 'Incorrect email or password')

      expect(validateMock).toHaveBeenCalledWith(
        loginInfo.username,
        loginInfo.password
      )
      expect(findSpy).toHaveBeenCalledWith(loginInfo.username)
    })

    it('should return the user ingo with the token as a cookie', async () => {
      const loginInfo = {
        username: 'registered@mail.com',
        password: 'secretpassword',
      }

      const registeredMock = {
        email: 'registered@mail.com',
        name: 'Texas Red',
        id: 'someid',
        isAnonymous: false,
        isPasswordMatch: () => true,
      }

      const validateMock = jest.spyOn(authMock, 'validateEmailAndPassword')
      const findSpy =
        UserServiceMock.findByEmail.mockResolvedValue(registeredMock)

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginInfo)

      expect(res.headers['set-cookie'][0]).toContain(
        `${AppConfigServiceMock.tokenName}=`
      )

      delete registeredMock.isPasswordMatch
      expect(res.statusCode).toBe(201)
      expect(res.body).toEqual(registeredMock)

      expect(validateMock).toHaveBeenCalledWith(
        loginInfo.username,
        loginInfo.password
      )
      expect(findSpy).toHaveBeenCalledWith(loginInfo.username)
    })
  })

  describe('#GET /auth/signout', () => {
    it('should expire the token', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/signout')
        .set('Cookie', [accessToken])

      expect(res.headers['set-cookie'][0]).toContain(
        `${AppConfigServiceMock.tokenName}=`
      )

      const [, expires] = res.headers['set-cookie'][0].split('Expires=')
      const date = new Date(expires)
      expect(date.getTime()).toBeLessThan(new Date().getTime())
    })
  })
})
