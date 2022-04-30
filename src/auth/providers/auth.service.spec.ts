import { HttpException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'
import { fail } from 'assert'
import { UserDocument } from '../../utils/schemas/users.schema'
import { AuthService } from './auth.service'
import { UserService } from './user.service'

describe('AuthService', () => {
  let service: AuthService

  const UserServiceMock = {
    findByEmail: jest.fn(),
  }

  const JwtServiceMock = {
    sign: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: UserServiceMock,
        },
        {
          provide: JwtService,
          useValue: JwtServiceMock,
        },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('#validateEmailAndPassword', () => {
    it('should throw an error if the email or the password mismatch', async () => {
      const userDoc = {
        id: 'someid',
        email: 'something@nesquik.com',
        isPasswordMatch: jest.fn(),
      }

      const password = 'password123'

      userDoc.isPasswordMatch.mockResolvedValue(false)
      const findSpy = jest
        .spyOn(UserServiceMock, 'findByEmail')
        .mockResolvedValue(userDoc)

      try {
        await service.validateEmailAndPassword(userDoc.email, password)
        fail('unexpected code path')
      } catch (error) {
        expect(findSpy).toHaveBeenCalledWith(userDoc.email)
        expect(error).toBeInstanceOf(HttpException)
        expect(error.status).toBe(422)
        expect(error.message).toEqual('Incorrect email or password')
      }
    })

    it('should return the user if the password matches', async () => {
      const userDoc = {
        id: 'someid',
        email: 'something@nesquik.com',
        isPasswordMatch: jest.fn(),
      }

      const password = 'password123'

      userDoc.isPasswordMatch.mockResolvedValue(true)
      const findSpy = jest
        .spyOn(UserServiceMock, 'findByEmail')
        .mockResolvedValue(userDoc)

      try {
        await service.validateEmailAndPassword(userDoc.email, password)

        expect(findSpy).toHaveBeenCalledWith(userDoc.email)
      } catch (error) {
        fail(`unexpected code path: ${error.message}`)
      }
    })
  })

  describe('#createToken', () => {
    it('should sign the token', () => {
      const userDoc: Partial<UserDocument> = {
        id: 'someid',
        email: 'something@nesquik.com',
      }

      const token = 'jwt.info'
      const signSpy = jest.spyOn(JwtServiceMock, 'sign').mockReturnValue(token)

      const info = service.createToken(userDoc as UserDocument)

      expect(signSpy).toHaveBeenCalledWith({
        sub: userDoc.id,
        email: userDoc.email,
      })
      expect(info.user).toEqual(userDoc)
      expect(info.accessToken).toEqual(token)
    })
  })
})
