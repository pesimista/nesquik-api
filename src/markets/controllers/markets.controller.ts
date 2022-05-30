import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common'
import { CategoriesService } from '../../categories/providers/categories.service'
import { JwtAuthGuard } from '../../utils/guards/jwt-auth.guard'
import { Market } from '../../utils/schemas/market.schema'
import { ResponseList } from '../../utils/types/responseList'
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
  async findAll(): Promise<ResponseList<Market>> {
    const items = await this.service.getAllMarkets()

    return {
      count: items.length,
      items,
    }
  }

  @Get(':storeid')
  @UseGuards(JwtAuthGuard)
  async findMarket(
    @Param('storeid') id: string
  ): Promise<SingleMarketResponse> {
    try {
      const doc = await this.service.getSingle(id)

      if (!doc) {
        throw new HttpException(
          'Market with the given id not found',
          HttpStatus.NOT_FOUND
        )
      }

      const response = doc.toJSON() as SingleMarketResponse

      const marketCategories = await this.categoriesService.getByMarketId(
        doc._id
      )
      response.marketCategories = marketCategories

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
