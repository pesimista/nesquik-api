import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Schedule } from 'nesquik-types'
import { Logger } from 'winston'
import { Banner, BannerDocument } from '../../utils/schemas/banners.schema'
import {
  Category,
  CategoryDocument,
} from '../../utils/schemas/categories.schema'
import { Market, MarketDocument } from '../../utils/schemas/market.schema'
import { ImportMarketDto } from '../dto/importMaket.dto'
import { PostMarketDto } from '../dto/postMarket.dto'

type FullHourType = { hour: number | string; minutes: number | string }

@Injectable()
export class MarketsService {
  constructor(
    @Inject('winston') private logger: Logger,
    @InjectModel(Market.name) private model: Model<MarketDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Banner.name) private bannerModel: Model<BannerDocument>
  ) {}

  async getAllMarkets(): Promise<MarketDocument[]> {
    return this.model.find().populate('categories').sort('order')
  }

  async getSingle(marketID: string): Promise<MarketDocument> {
    let doc
    if (marketID.length === 24) {
      this.logger.info('searching market by doc.id', { marketID })
      doc = await this.model.findById(marketID)
    }

    if (!doc) {
      this.logger.info('searching market by doc.marketID', { marketID })
      doc = await this.model.findOne({ marketID })
    }

    return doc
  }

  async createMarket(dto: PostMarketDto): Promise<MarketDocument> {
    const doc = await this.getSingle(dto.marketID)

    if (doc) {
      throw new HttpException(
        'Market with given marketID already exists',
        HttpStatus.CONFLICT
      )
    }

    const categoryPromise = dto.categoriesIds.map((item) =>
      this.categoryModel.findById(item)
    )

    const categoryItems = await Promise.all(categoryPromise)

    // const scheduleItems = schedule.map((item) => {
    //   const initialTime = this.getFullHour(item.initialTime)
    //   const finalTime = this.getFullHour(item.finalTime)

    //   return {
    //     ...item,
    //     initialTime: `${initialTime.hour}:${initialTime.minutes}`,
    //     finalTime: `${finalTime.hour}:${finalTime.minutes}`,
    //   }
    // })

    const marketDoc = this.model.create({
      ...dto,
      categories: categoryItems.filter(Boolean),
      marketing: [],
      schedule: [],
    })

    return marketDoc
  }

  async parseQuikMaket({
    ranking,
    schedule,
    ...market
  }: ImportMarketDto): Promise<Partial<Market>> {
    const scheduleItems: Partial<Schedule>[] = schedule.map((item) => {
      const initialTime = this.getFullHour(item.initialTime, false)
      const finalTime = this.getFullHour(item.finalTime, false)

      return {
        initialTime: `${initialTime.hour}:${initialTime.minutes}`,
        finalTime: `${finalTime.hour}:${finalTime.minutes}`,
      }
    })

    const marketing = market.marketing?.map((item) => {
      return new this.bannerModel({
        ...item,
        queryParams: {
          storeid: market.marketID,
          productID: item.queryParams.dialog?.split('~')[1],
        },
      })
    })

    return {
      address: market.address,
      addressName: market.addressName,
      bikeDistance: market.bikeDistance,
      coordinates: market.coordinates,
      estimatedTime: market.estimatedTime,
      hasFreeDelivery: market.hasFreeDelivery,
      images: market.images,
      isOnlyQuik: market.isOnlyQuik,
      logo: market.logo,
      marketID: market.marketID,
      maxDeliveryRange: market.maxDeliveryRange,
      name: market.name,
      radiusDistance: market.radiusDistance,
      rating: market.rating,
      order: ranking,
      marketing,
      hasPromo: Boolean(market.hasPromo),
      schedule: scheduleItems,
    }
  }

  async importMarket(dto: ImportMarketDto): Promise<MarketDocument> {
    const context = { marketID: dto.marketID, name: dto.name }

    const market = await this.parseQuikMaket(dto)
    const doc = await this.getSingle(dto.marketID)

    const categoryPromise = dto.categories.categoriesDescriptions.map((item) =>
      this.categoryModel.findOne({ categoryID: item.categoryID })
    )

    const categoryItems = await Promise.all(categoryPromise)

    if (doc) {
      this.logger.info('updating market doc', context)
      return await doc.updateOne({
        ...market,
        categories: categoryItems.filter(Boolean),
      })
    }

    this.logger.info('creating market doc', context)
    return await this.model.create({
      ...market,
      categories: categoryItems.filter(Boolean),
    })
  }

  getFullHour(value: string, asNumber = true): FullHourType {
    const [time, term] = value.toLocaleLowerCase().split(' ')
    const items = time.split(':').map(parseFloat)

    if (!time.startsWith('12') && term.includes('pm')) {
      items[0] += 12
    }

    const response: FullHourType = { hour: items[0], minutes: items[1] }
    if (!asNumber) {
      response.hour = response.hour.toString().padStart(2, '0')
      response.minutes = response.minutes.toString().padStart(2, '0')
    }

    return response
  }
}
