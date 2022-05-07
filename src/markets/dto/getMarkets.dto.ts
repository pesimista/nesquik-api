import { Type, Transform } from 'class-transformer'
import { IsOptional, IsArray, IsString } from 'class-validator'

export class GetMarketDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  @Transform(({ value }) => value.split(','))
  expand?: string[]
}
