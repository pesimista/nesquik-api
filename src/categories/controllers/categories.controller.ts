import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { PostCategoryDto } from '../dto/postCategory.dto'
import { CategoriesService } from '../providers/categories.service'
import { Category } from '../../utils/schemas/categories.schema'
import { AppConfigService } from '../../config/providers/configuration.service'
import { FindMarketCategoriesResponse } from '../types/findMarketCategories.response'
import { JwtAuthGuard } from '../../utils/guards/jwt-auth.guard'
import { MarketsService } from '../../markets/providers/markets.service'

@Controller('categories')
export class CategoriesController {
  constructor(
    private service: CategoriesService,
    private marketsService: MarketsService,
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
      const doc = await this.service.getSingle(categoryID)

      if (!doc) {
        throw new NotFoundException('Category with the given id not found')
      }
      return doc
    } catch (error) {
      throw error
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createCategory(@Body() dto: PostCategoryDto): Promise<Category> {
    let market
    if (dto.marketID) {
      market = await this.marketsService.getSingle(dto.marketID)
    }

    return this.service.importCategory(dto, market)
  }
}
