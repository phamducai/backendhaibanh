import { IsString, IsUUID, IsInt, IsOptional, IsBoolean, Min, IsUrl } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateLessonDto {
  @IsString()
  chapterid: string;

  @IsString()
  lessonname: string;

  @IsOptional()
  videourl?: string;

  @IsString()
  @IsOptional()
  duration?: string;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  displayorder: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isdeleted?: boolean;

  @IsOptional()
  productid?: string;

}