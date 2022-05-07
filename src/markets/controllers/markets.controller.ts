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
import { CategoriesService } from '../../categories/providers/categories.service'
import { JwtAuthGuard } from '../../utils/guards/jwt-auth.guard'
import { Market } from '../../utils/schemas/market.schema'
import { GetMarketDto } from '../dto/getMarkets.dto'
import { ImportMarketDto } from '../dto/importMaket.dto'
import { PostMarketDto } from '../dto/postMarket.dto'
import { MarketsService } from '../providers/markets.service'
import { SingleMarketResponse } from '../types/singleMarket.response'

@Controller('markets')
export class MarketsController {
  constructor(
    private service: MarketsService,
    private categoriesService: CategoriesService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(): Promise<Market[]> {
    return this.service.getAllMarkets()
  }

  @Get(':storeid')
  @UseGuards(JwtAuthGuard)
  async findMarket(
    @Param('storeid') id: string,
    @Query() query: GetMarketDto
  ): Promise<SingleMarketResponse> {
    try {
      const doc = await this.service.getSingleMarket(id)

      if (!doc) {
        throw new HttpException(
          'Market with the given id not found',
          HttpStatus.NOT_FOUND
        )
      }

      const response = doc.toJSON() as SingleMarketResponse

      if (query.expand?.includes('categories')) {
        doc.populate('categories')
      }

      if (query.expand?.includes('marketCategories')) {
        const marketCategories = await this.categoriesService.getByMarketId(
          doc._id
        )
        response.marketCategories = marketCategories
      }

      return response
    } catch (error) {
      throw error
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createMarket(@Body() dto: PostMarketDto): Promise<Market> {
    return this.service.createMarket(dto)
  }

  @Post('import')
  @UseGuards(JwtAuthGuard)
  async importMarket(@Body() dto: ImportMarketDto): Promise<Market> {
    return this.service.importMarket(dto)
  }
}
