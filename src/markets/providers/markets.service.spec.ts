import { HttpException, HttpStatus } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { fail } from 'assert'
import { Model } from 'mongoose'
import { LoggerMock } from '../../../test/mocks/logger.mock'
import { MarketMock, QuikMarketMock } from '../../../test/mocks/market.mock'
import {
  Category,
  CategoryDocument,
} from '../../utils/schemas/categories.schema'
import { Banner } from '../../utils/schemas/banners.schema'
import { PostMarketDto } from '../dto/postMarket.dto'
import { Market, MarketDocument } from '../../utils/schemas/market.schema'
import { MarketsService } from './markets.service'

type MarketModel = Model<MarketDocument>
type CategoryModel = Model<CategoryDocument>

describe('MarketsService', () => {
  let service: MarketsService
  let mockMarketModel: MarketModel
  let mockCategoryModel: CategoryModel
  let mockBannerModel: jest.Mock

  const ModelMock = {
    ...Model,
    find: jest.fn(),
    create: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarketsService,
        { provide: 'winston', useValue: LoggerMock },
        {
          provide: getModelToken(Market.name),
          useValue: ModelMock,
        },
        {
          provide: getModelToken(Category.name),
          useValue: ModelMock,
        },
        {
          provide: getModelToken(Banner.name),
          useValue: jest.fn(),
        },
      ],
    }).compile()

    service = module.get<MarketsService>(MarketsService)
    mockMarketModel = module.get<MarketModel>(getModelToken(Market.name))
    mockCategoryModel = module.get<CategoryModel>(getModelToken(Category.name))
    mockBannerModel = module.get<jest.Mock>(getModelToken(Banner.name))
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('#getAllMarkets', () => {
    it('should call the right methods', async () => {
      const query = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([]),
      }

      mockMarketModel.find = jest.fn().mockReturnValue(query)

      await service.getAllMarkets()

      expect(mockMarketModel.find).toHaveBeenCalled()
      expect(query.populate).toHaveBeenCalledWith('categories')
      expect(query.sort).toHaveBeenCalled()
    })
  })

  describe('#getFullHour', () => {
    it('should return the right values for morning time', async () => {
      const res = service.getFullHour('11:37 am')

      expect(res.hour).toEqual(11)
      expect(res.minutes).toEqual(37)
    })

    it('should return the right values for noon time', async () => {
      const res = service.getFullHour('12:15 pm')

      expect(res.hour).toEqual(12)
      expect(res.minutes).toEqual(15)
    })

    it('should return the right values for afternoon time', async () => {
      const res = service.getFullHour('3:23 pm')

      expect(res.hour).toEqual(15)
      expect(res.minutes).toEqual(23)
    })
  })

  describe('#getSingleMarket', () => {
    it('should find the doc by id', async () => {
      const market = {
        id: 'marketID',
        name: 'Pizza Hut',
      }

      const findByIdSpy = jest
        .spyOn(mockMarketModel, 'findById')
        .mockResolvedValue(market)
      const findOneSpy = jest.spyOn(mockMarketModel, 'findOne')

      try {
        const res = await service.getSingleMarket('626a374e48d953beb475a2e4')
        expect(findByIdSpy).toHaveBeenCalledWith('626a374e48d953beb475a2e4')
        expect(findOneSpy).not.toHaveBeenCalled()
        expect(res).toEqual(market)
      } catch (error) {
        fail(`unexpected code path: ${error.message}`)
      }
    })

    it('should find the doc by id', async () => {
      const market = {
        id: 'anotherID',
        marketID: 'marketID',
        name: 'Pizza Hut',
      }

      const findOneSpy = jest
        .spyOn(mockMarketModel, 'findOne')
        .mockResolvedValue(market)

      try {
        const res = await service.getSingleMarket('marketID')
        expect(findOneSpy).toHaveBeenCalledWith({ marketID: 'marketID' })
        expect(res).toEqual(market)
      } catch (error) {
        fail(`unexpected code path: ${error.message}`)
      }
    })
  })

  describe('#parseQuikMaket', () => {
    it('should throw an error if the marketID is already registered', async () => {
      mockBannerModel.mockImplementation((item) => item)

      const market = QuikMarketMock
      const hourSpy = jest.spyOn(service, 'getFullHour')

      try {
        const res = await service.parseQuikMaket(QuikMarketMock)

        expect(res).toHaveProperty('address', market.address)
        expect(res).toHaveProperty('addressName', market.addressName)
        expect(res).toHaveProperty('bikeDistance', market.bikeDistance)
        expect(res).toHaveProperty('coordinates', market.coordinates)
        expect(res).toHaveProperty('estimatedTime', market.estimatedTime)
        expect(res).toHaveProperty('hasFreeDelivery', market.hasFreeDelivery)
        expect(res).toHaveProperty('images', market.images)
        expect(res).toHaveProperty('isOnlyQuik', market.isOnlyQuik)
        expect(res).toHaveProperty('logo', market.logo)
        expect(res).toHaveProperty('marketID', market.marketID)
        expect(res).toHaveProperty('maxDeliveryRange', market.maxDeliveryRange)
        expect(res).toHaveProperty('name', market.name)
        expect(res).toHaveProperty('radiusDistance', market.radiusDistance)
        expect(res).toHaveProperty('rating', market.rating)
        expect(res).toHaveProperty('order', market.ranking)
        expect(res).toHaveProperty('marketing')
        expect(res).toHaveProperty('hasPromo', false)
        expect(res).not.toHaveProperty('categories')
        expect(res).toHaveProperty('schedule')

        expect(mockBannerModel).toHaveBeenCalledTimes(market.marketing.length)
        expect(hourSpy).toHaveBeenCalledTimes(market.schedule.length * 2)
      } catch (error) {
        fail(`unexpected code path: ${error.message}`)
      }
    })
  })

  describe('#importedMarket', () => {
    it('should update the market', async () => {
      const doc = { updateOne: jest.fn() }
      const market = QuikMarketMock

      jest.spyOn(mockMarketModel, 'findOne').mockResolvedValue(doc)
      jest.spyOn(service, 'parseQuikMaket').mockResolvedValue({
        marketID: market.marketID,
      })

      await service.importMarket(market)

      expect(doc.updateOne).toHaveBeenCalled()
      expect(mockMarketModel.create).not.toHaveBeenCalled()
    })

    it('should update the market', async () => {
      const market = QuikMarketMock
      const doc = { updateOne: jest.fn() }

      jest.spyOn(mockMarketModel, 'create').mockImplementation(() => doc)
      jest.spyOn(mockMarketModel, 'findById').mockResolvedValue(null)
      jest.spyOn(mockMarketModel, 'findOne').mockResolvedValue(null)
      jest.spyOn(service, 'parseQuikMaket').mockResolvedValue({
        marketID: market.marketID,
      })

      await service.importMarket(market)

      expect(mockMarketModel.create).toHaveBeenCalled()
      expect(doc.updateOne).not.toHaveBeenCalled()
    })
  })

  describe('#createMarket', () => {
    it('should throw an error if the marketID is registered', async () => {
      const doc = { updateOne: jest.fn() }
      const market = MarketMock

      jest.spyOn(mockMarketModel, 'findOne').mockResolvedValue(doc)
      const createSpy = jest
        .spyOn(mockMarketModel, 'create')
        .mockImplementation(() => doc)

      try {
        await service.createMarket(market)
        fail('unexpected code path')
      } catch (error) {
        expect(createSpy).not.toHaveBeenCalled()
        expect(error).toBeInstanceOf(HttpException)
        expect(error.status).toEqual(HttpStatus.CONFLICT)
        expect(error.message).toEqual(
          'Market with given marketID already exists'
        )
      }
    })

    it('call the right methods and create a new marker document', async () => {
      const market = MarketMock
      const doc = { update: jest.fn() }

      jest.spyOn(mockCategoryModel, 'findById').mockResolvedValue(null)
      jest.spyOn(mockMarketModel, 'findById').mockResolvedValue(null)
      jest.spyOn(mockMarketModel, 'findOne').mockResolvedValue(null)
      const createSpy = jest
        .spyOn(mockMarketModel, 'create')
        .mockImplementation((item: PostMarketDto) => ({
          ...doc,
          marketID: item.marketID,
        }))

      try {
        const doc = await service.createMarket(market)

        expect(doc).toHaveProperty('marketID', market.marketID)
        expect(createSpy).toHaveBeenCalled()
      } catch (error) {
        fail(`unexpected code path: ${error.message}`)
      }
    })
  })
})
