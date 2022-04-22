import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class RegisterUserDto {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsEmail()
  @IsString()
  email: string

  @IsNotEmpty()
  @IsString()
  password: string
}
