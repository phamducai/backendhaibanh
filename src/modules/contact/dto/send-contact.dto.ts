import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class SendContactDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsNotEmpty()
  @IsString()
  message: string;
} 