import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { PostCategoryDto } from '../dto/postCategory.dto'
import {
  Category,
  CategoryDocument,
} from '../../utils/schemas/categories.schema'

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private model: Model<CategoryDocument>
  ) {}

  async getAll(): Promise<Category[]> {
    console.log(this.model.collection.name)
    return this.model.find()
  }

  async createOrUpdate(dto: PostCategoryDto): Promise<Category> {
    const doc = await this.model.findOne({ categoryID: dto.categoryID })

    if (doc) {
      // doc.parent = dto.?parent
      return doc.updateOne(dto)
      // throw new HttpException(
      //   'the category already exists',
      //   HttpStatus.CONFLICT
      // )
    }

    const category = await this.model.create(dto)

    return category
  }
}
