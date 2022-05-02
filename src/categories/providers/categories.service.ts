import { Inject, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Logger } from 'winston'
import { MarketsService } from '../../markets/providers/markets.service'
import {
  Category,
  CategoryDocument,
} from '../../utils/schemas/categories.schema'
import { PostCategoryDto } from '../dto/postCategory.dto'

@Injectable()
export class CategoriesService {
  constructor(
    @Inject('winston') private logger: Logger,
    @InjectModel(Category.name) private model: Model<CategoryDocument>,
    private marketService: MarketsService
  ) {}

  async getCategories(parent?: string): Promise<CategoryDocument[]> {
    const context = {
      name: this.getCategories.name,
      parent,
    }

    this.logger.info('retrieving category docs', context)
    let query = this.model.find()

    if (parent) {
      query = this.model.find({ parent })
    }

    const docs = await query.sort('order')
    this.logger.debug(`found ${docs.length} category docs`, context)
    return docs
  }

  async getSingle(categoryID: string): Promise<CategoryDocument> {
    const context = {
      name: this.getSingle.name,
      categoryID,
    }

    let doc
    if (categoryID.length === 24) {
      this.logger.info('searching category by doc.id', context)
      doc = await this.model.findById(categoryID)
    }

    if (!doc) {
      this.logger.info('searching category by doc.categoryID', context)
      doc = await this.model.findOne({ categoryID })
    }

    return doc
  }

  async getByMarketId(marketID: string): Promise<CategoryDocument[]> {
    const context = {
      name: this.getByMarketId.name,
      marketID,
    }

    this.logger.info('retrieving category docs', context)
    const docs = await this.model.find({ marketID }).sort({ order: 'desc' })
    this.logger.debug(`found ${docs.length} category docs`, context)
    return docs
  }

  async getCategoriesInMarket(marketID: string): Promise<CategoryDocument[]> {
    const context = {
      name: this.getCategoriesInMarket.name,
      marketID,
    }

    this.logger.info('retrieving categories in market', context)
    const doc = await this.marketService.getSingleMarket(marketID)

    if (!doc) {
      this.logger.info('no document with the given id', context)
      return []
    }

    await doc.populate('categories')

    return doc.categories as CategoryDocument[]
  }

  async importCategory(dto: PostCategoryDto): Promise<CategoryDocument> {
    const context = {
      name: this.importCategory.name,
      categoryID: dto.categoryID,
      marketName: dto.name,
      marketID: dto.marketID,
    }

    const doc = await this.model.findOne({ categoryID: dto.categoryID })
    const market = await this.marketService.getSingleMarket(dto.marketID)

    if (doc) {
      this.logger.info('updating category doc', context)
      return doc.updateOne({ ...dto, marketID: market })
    }

    this.logger.info('creating category doc', context)
    const category = await this.model.create({ ...dto, marketID: market })

    return category
  }
}
