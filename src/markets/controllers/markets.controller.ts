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
import { JwtAuthGuard } from '../../utils/guards/jwt-auth.guard'
import { ImportMarketDto } from '../dto/importMaket.dto'
import { PostMarketDto } from '../dto/postMarket.dto'
import { MarketsService } from '../providers/markets.service'
import { Market, MarketDocument } from '../../utils/schemas/market.schema'

@Controller('markets')
export class MarketsController {
  constructor(private service: MarketsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(): Promise<Market[]> {
    return this.service.getAllMarkets()
  }

  @Get(':storeid')
  @UseGuards(JwtAuthGuard)
  async findMarket(@Param('storeid') id: string): Promise<MarketDocument> {
    try {
      const doc = await this.service.getSingleMarket(id)

      if (!doc) {
        throw new HttpException('Market not found', HttpStatus.NOT_FOUND)
      }

      return doc
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
