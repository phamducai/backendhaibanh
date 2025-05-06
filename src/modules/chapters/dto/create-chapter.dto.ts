import { IsString, IsUUID, IsInt, IsOptional, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateChapterDto {
  @IsUUID()
  productid: string;

  @IsString()
  chaptername: string;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  displayorder: number;

  @IsBoolean()
  @IsOptional()
  isdeleted?: boolean;
}