import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { AppConfigService } from '../../config/providers/configuration.service'
import { MarketsService } from '../../markets/providers/markets.service'
import { JwtAuthGuard } from '../../utils/guards/jwt-auth.guard'
import { Category } from '../../utils/schemas/categories.schema'
import { PostCategoryDto } from '../dto/postCategory.dto'
import { CategoriesService } from '../providers/categories.service'
import { FindMarketCategoriesResponse } from '../types/findMarketCategories.response'

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
        throw new HttpException(
          'Category with the given id not found',
          HttpStatus.NOT_FOUND
        )
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
