import { IsEmail, IsNotEmpty, MinLength, IsString, IsOptional } from 'class-validator';

export class RegisterUserDto {
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
