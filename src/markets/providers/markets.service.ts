import { Model } from 'mongoose'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Market, MarketDocument } from '../schemas/market.schema'
import { PostMarketDto } from '../dto/postMarket.dto'
import {
  Category,
  CategoryDocument,
} from 'src/categories/schemas/categories.schema'
import { Banner, BannerDocument } from 'src/shared/schemas/banners.schema'

@Injectable()
export class MarketsService {
  constructor(
    @InjectModel(Market.name) private model: Model<MarketDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Banner.name) private bannerModel: Model<BannerDocument>
  ) {}

  async getAll(): Promise<Market[]> {
    return this.model.find().populate('categories')
  }

  async getSingleMarket(marketID: string): Promise<MarketDocument> {
    return this.model.findOne({ marketID })
  }

  async createOrUpdate(dto: PostMarketDto): Promise<Market> {
    const market = await this.getSingleMarket(dto.marketID)

    if (market) {
      console.log(`updating ${dto.marketID} ${dto.name}`)
      return this.update(market, dto)
    }

    console.log(`creating ${dto.marketID} ${dto.name}`)
    return this.create(dto)
  }

  async create({
    ranking,
    categories,
    schedule,
    ...market
  }: PostMarketDto): Promise<Market> {
    const categoryPromise = categories['categoriesDescriptions'].map((item) =>
      this.categoryModel.findOne({ categoryID: item.categoryID })
    )

    const categoryItems = await Promise.all(categoryPromise)

    const scheduleItems = schedule.map((item) => {
      const initialTime = this.getFullHour(item.initialTime)
      const finalTime = this.getFullHour(item.finalTime)

      return {
        ...item,
        initialTime: `${initialTime.hour}:${initialTime.minutes}`,
        finalTime: `${finalTime.hour}:${finalTime.minutes}`,
      }
    })

    const marketDoc = this.model.create({
      ...market,
      order: ranking,
      hasPromo: Boolean(market.hasPromo),
      categories: categoryItems.filter(Boolean),
      schedule: scheduleItems,
    })

    return marketDoc
  }

  async update(
    doc: MarketDocument,
    { ranking, categories }: PostMarketDto
  ): Promise<Market> {
    const categoryPromise = categories['categoriesDescriptions'].map((item) =>
      this.categoryModel.findOne({ categoryID: item.categoryID })
    )

    const categoryItems = await Promise.all(categoryPromise)

    doc.categories = categoryItems.filter(Boolean)
    doc.order = ranking
    doc.marketing = doc.marketing.map((item) => new this.bannerModel(item))
    await doc.save()

    return doc
  }

  getFullHour(value: string): { hour: number; minutes: number } {
    const [time, term] = value.toLocaleLowerCase().split(' ')
    const items = time.split(':').map(parseFloat)

    if (!time.startsWith('12') && term.includes('pm')) {
      items[0] += 12
    }

    return { hour: items[0], minutes: items[1] }
  }
}
