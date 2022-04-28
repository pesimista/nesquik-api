import { HttpException } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { fail } from 'assert'
import { Model } from 'mongoose'
import { RegisterUserDto } from '../dto/register.dto'
import { User, UserDocument, UserModel } from '../schemas/users.schema'
import { UserService } from './user.service'

describe('UserService', () => {
  let service: UserService
  let mockUserModel: Model<UserDocument>

  const ModelValue = {
    ...Model,
    create: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: ModelValue,
        },
      ],
    }).compile()

    service = module.get<UserService>(UserService)
    mockUserModel = module.get<UserModel>(getModelToken(User.name))
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('#register', () => {
    it('should throw an error if the user is not anonymus', async () => {
      const dto: RegisterUserDto = {
        name: 'texas',
        email: 'something@nesquik.com',
        password: 'secretpassword',
        lastName: 'red',
      }

      const user = {
        isAnonymous: false,
        email: 'test@user.com',
        save: jest.fn(),
      }

      const saveSpy = jest.spyOn(user, 'save')
      const findSpy = jest
        .spyOn(mockUserModel, 'findById')
        .mockResolvedValue(user)

      try {
        await service.register(dto, 'anonym')
        fail('unexpected code path')
      } catch (error) {
        expect(findSpy).toHaveBeenCalledWith('anonym')
        expect(saveSpy).not.toHaveBeenCalled()
        expect(error.status).toBe(409)
        expect(error.message).toBe('This user is not anonymous')
      }
    })

    it('should throw an error if the email is already taken', async () => {
      const dto: RegisterUserDto = {
        name: 'texas',
        email: 'something@nesquik.com',
        password: 'secretpassword',
        lastName: 'red',
      }

      const user = {
        isAnonymous: true,
        email: 'test@user.com',
        save: jest.fn(),
      }

      const saveSpy = jest
        .spyOn(user, 'save')
        .mockRejectedValue({ code: 11000 })
      const findSpy = jest
        .spyOn(mockUserModel, 'findById')
        .mockResolvedValue(user)

      try {
        await service.register(dto, 'anonym')
        fail('unexpected code path')
      } catch (error) {
        expect(findSpy).toHaveBeenCalledWith('anonym')
        expect(saveSpy).toHaveBeenCalled()
        expect(error.status).toBe(409)
        expect(error.message).toBe('Email already taken')
      }
    })

    it('should create the user and return it with isAnonymous as false', async () => {
      const dto: RegisterUserDto = {
        name: 'texas',
        email: 'something@nesquik.com',
        password: 'secretpassword',
        lastName: 'red',
      }

      const user = {
        email: 'test@user.com',
        isAnonymous: true,
        save: jest.fn(),
      }
      // await mockUserModel.create({ isAnonymous: true })

      const saveSpy = jest.spyOn(user, 'save').mockImplementation()
      const findSpy = jest
        .spyOn(mockUserModel, 'findById')
        .mockResolvedValue(user)

      try {
        const user = await service.register(dto, 'anonym')

        expect(user.name).toEqual(dto.name)
        expect(user.email).toEqual(dto.email)
        expect(user.isAnonymous).toBeFalsy()
        expect(user.password).toEqual(dto.password)

        expect(findSpy).toHaveBeenCalledWith('anonym')
        expect(saveSpy).toHaveBeenCalled()
      } catch (error) {
        fail(`unexpected code path: ${error.message}`)
      }
    })
  })

  describe('#createAnonymus', () => {
    it('should throw an error if the email is taken by chance', async () => {
      const createSpy = jest
        .spyOn(mockUserModel, 'create')
        .mockImplementation(() => {
          throw { code: 11000 }
        })

      try {
        await service.createAnonymus()
        fail('unexpected code path')
      } catch (error) {
        expect(createSpy).toHaveBeenCalled()
        expect(error).toBeInstanceOf(HttpException)
        expect(error.status).toBe(409)
        expect(error.message).toBe('Email already taken')
      }
    })

    it('should still throw an error different that taken email', async () => {
      const createSpy = jest
        .spyOn(mockUserModel, 'create')
        .mockImplementation(() => {
          throw new Error('intended error')
        })

      try {
        await service.createAnonymus()
        fail('unexpected code path')
      } catch (error) {
        expect(createSpy).toHaveBeenCalled()
        expect(error).not.toBeInstanceOf(HttpException)
        expect(error.message).toBe('intended error')
      }
    })

    it('should create an anonymous user', async () => {
      const user = {
        name: 'test',
        email: 'test@user.com',
        isAnonymous: true,
      }

      const createSpy = jest
        .spyOn(mockUserModel, 'create')
        .mockImplementation(() => user)

      try {
        const doc = await service.createAnonymus()

        expect(doc).toEqual(user)

        expect(createSpy).toHaveBeenCalled()
      } catch (error) {
        fail('unexpected code path')
      }
    })
  })

  describe('#findByEmail', () => {
    it('should get an user by email', async () => {
      const user = {
        name: 'test',
        email: 'something@nesquik.com',
        save: jest.fn(),
      }

      const findSpy = jest
        .spyOn(mockUserModel, 'findOne')
        .mockResolvedValue(user)

      const saveSpy = jest.spyOn(user, 'save')

      const doc = await service.findByEmail('something@nesquik.com')

      expect(doc.name).toEqual(user.name)
      expect(doc.email).toEqual(user.email)
      expect(doc.lastAccess).toBeDefined()

      expect(findSpy).toHaveBeenCalledWith({ email: 'something@nesquik.com' })
      expect(saveSpy).toHaveBeenCalled()
    })

    it('should return null if the there is no user with the given email', async () => {
      const findSpy = jest
        .spyOn(mockUserModel, 'findOne')
        .mockResolvedValue(null)

      const doc = await service.findByEmail('something@nesquik.com')

      expect(doc).toBeNull()

      expect(findSpy).toHaveBeenCalledWith({ email: 'something@nesquik.com' })
    })
  })

  describe('#deleteAnonymous', () => {
    it('should not delete the doc if is not anonymous', async () => {
      const user = {
        id: 'someid',
        isAnonymous: false,
        delete: jest.fn(),
      }

      const findSpy = jest
        .spyOn(mockUserModel, 'findById')
        .mockResolvedValue(user)

      const deleteSpy = jest.spyOn(user, 'delete')

      const res = await service.deleteAnonymous('someid')

      expect(res).toBeFalsy()

      expect(findSpy).toHaveBeenCalledWith('someid')
      expect(deleteSpy).not.toHaveBeenCalled()
    })

    it('should delete the doc if its anonymous', async () => {
      const user = {
        id: 'someid',
        isAnonymous: true,
        delete: jest.fn(),
      }

      const findSpy = jest
        .spyOn(mockUserModel, 'findById')
        .mockResolvedValue(user)

      const deleteSpy = jest.spyOn(user, 'delete')

      const res = await service.deleteAnonymous('someid')

      expect(res).toBeTruthy()

      expect(findSpy).toHaveBeenCalledWith('someid')
      expect(deleteSpy).toHaveBeenCalled()
    })
  })
})
