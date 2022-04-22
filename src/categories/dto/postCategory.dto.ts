import { IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { Category } from 'nesquik-types'

export class PostCategoryDto implements Category {
  @IsNotEmpty()
  @IsString()
  categoryID: string

  @IsNotEmpty()
  @IsString()
  parent: string

  @IsNotEmpty()
  @IsString()
  image: string

  @IsNotEmpty()
  @IsString()
  name: string

  @IsOptional()
  @IsString()
  affiliateID: string
}
