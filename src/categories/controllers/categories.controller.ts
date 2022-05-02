import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common'
import { PostCategoryDto } from '../dto/postCategory.dto'
import { CategoriesService } from '../providers/categories.service'
import { Category } from '../../utils/schemas/categories.schema'
import { AppConfigService } from '../../config/providers/configuration.service'
import { FindMarketCategoriesResponse } from '../types/findMarketCategories.response'

@Controller('categories')
export class CategoriesController {
  constructor(
    private service: CategoriesService,
    private config: AppConfigService
  ) {}

  @Get()
  async findAll(@Query('parent') parent: string): Promise<Category[]> {
    parent = parent || this.config.defaultParentCategory

    return this.service.getCategories(parent)
  }

  @Get('market/:marketid')
  async findMarketCategories(
    @Param('marketid') marketID: string
  ): Promise<FindMarketCategoriesResponse> {
    try {
      const [categories, marketCategories] = await Promise.all([
        this.service.getCategoriesInMarket(marketID),
        this.service.getByMarketId(marketID),
      ])

      return { categories, marketCategories }
    } catch (error) {
      throw error
    }
  }

  @Get(':id')
  async findCategory(@Param('id') categoryID: string): Promise<Category> {
    try {
      const doc = this.service.getSingle(categoryID)

      if (!doc) {
        throw new NotFoundException('Category with the given id not found')
      }
      return doc
    } catch (error) {
      throw error
    }
  }

  @Post()
  async createCategory(@Body() dto: PostCategoryDto): Promise<Category> {
    return this.service.importCategory(dto)
  }
}
