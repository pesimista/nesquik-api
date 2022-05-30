import { HttpException, HttpStatus } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { fail } from 'assert'
import { CategoryMock } from '../../../test/mocks/categories.mock'
import { LoggerMock } from '../../../test/mocks/logger.mock'
import { MarketMock, QuikMarketMock } from '../../../test/mocks/market.mock'
import { ModelMock, ModelMockType } from '../../../test/mocks/mongoose.mock'
import { Banner } from '../../utils/schemas/banners.schema'
import { Category } from '../../utils/schemas/categories.schema'
import { Market } from '../../utils/schemas/market.schema'
import { MarketsService } from './markets.service'

describe('MarketsService', () => {
  let service: MarketsService
  let marketModelMock: ModelMockType
  let bannerModelMock: jest.Mock

  beforeEach(async () => {
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarketsService,
        { provide: 'winston', useValue: LoggerMock },
        {
          provide: getModelToken(Market.name),
          useValue: ModelMock([MarketMock]),
        },
        {
          provide: getModelToken(Category.name),
          useValue: ModelMock([CategoryMock]),
        },
        {
          provide: getModelToken(Banner.name),
          useValue: jest.fn(),
        },
      ],
    }).compile()

    service = module.get<MarketsService>(MarketsService)
    marketModelMock = module.get<ModelMockType>(getModelToken(Market.name))
    bannerModelMock = module.get<jest.Mock>(getModelToken(Banner.name))
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('#getAllMarkets', () => {
    it('should call the right methods', async () => {
      const query = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnValue(marketModelMock.collection),
      }

      marketModelMock.find = jest.fn().mockReturnValue(query)

      await service.getAllMarkets()

      expect(marketModelMock.find).toHaveBeenCalled()
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

  describe('#getSingle', () => {
    it('should find the doc by id', async () => {
      try {
        const res = await service.getSingle(MarketMock.id)

        expect(marketModelMock.findById).toHaveBeenCalledWith(MarketMock.id)
        expect(marketModelMock.findOne).not.toHaveBeenCalled()

        expect(res).toHaveProperty('id', MarketMock.id)
        expect(res).toHaveProperty('marketID', MarketMock.marketID)
      } catch (error) {
        fail(`unexpected code path: ${error.message}`)
      }
    })

    it('should find the doc by id', async () => {
      try {
        const res = await service.getSingle(MarketMock.marketID)
        expect(marketModelMock.findById).not.toHaveBeenCalled()
        expect(marketModelMock.findOne).toHaveBeenCalledWith({
          marketID: MarketMock.marketID,
        })

        expect(res).toHaveProperty('id', MarketMock.id)
        expect(res).toHaveProperty('marketID', MarketMock.marketID)
      } catch (error) {
        fail(`unexpected code path: ${error.message}`)
      }
    })
  })

  describe('#parseQuikMaket', () => {
    it('should throw an error if the marketID is already registered', async () => {
      bannerModelMock.mockImplementation((item) => item)

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

        expect(bannerModelMock).toHaveBeenCalledTimes(market.marketing.length)
        expect(hourSpy).toHaveBeenCalledTimes(market.schedule.length * 2)
      } catch (error) {
        fail(`unexpected code path: ${error.message}`)
      }
    })
  })

  describe('#importedMarket', () => {
    it('should update the market', async () => {
      const market = QuikMarketMock

      await service.importMarket(market)

      expect(marketModelMock.doc.updateOne).toHaveBeenCalled()
      expect(marketModelMock.create).not.toHaveBeenCalled()
    })

    it('should create the market', async () => {
      const market = QuikMarketMock
      marketModelMock.findOne = jest
        .fn()
        .mockReturnValue({ populate: () => null })

      await service.importMarket(market)

      expect(marketModelMock.create).toHaveBeenCalled()
      expect(marketModelMock.doc.updateOne).not.toHaveBeenCalled()
    })
  })

  describe('#createMarket', () => {
    it('should throw an error if the marketID is registered', async () => {
      const market = MarketMock

      try {
        await service.createMarket(market)
        fail('unexpected code path')
      } catch (error) {
        expect(marketModelMock.create).not.toHaveBeenCalled()
        expect(error).toBeInstanceOf(HttpException)
        expect(error.status).toEqual(HttpStatus.CONFLICT)
        expect(error.message).toEqual(
          'Market with given marketID already exists'
        )
      }
    })

    it('call the right methods and create a new marker document', async () => {
      const market = MarketMock
      marketModelMock.findOne = jest
        .fn()
        .mockReturnValue({ populate: () => null })

      try {
        const doc = await service.createMarket(market)

        expect(doc).toHaveProperty('marketID', market.marketID)
        expect(marketModelMock.create).toHaveBeenCalled()
      } catch (error) {
        fail(`unexpected code path: ${error.message}`)
      }
    })
  })
})
