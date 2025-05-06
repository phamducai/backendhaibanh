import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Res, StreamableFile, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { fileStorageConfig } from '../../config/file-storage.config';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', fileStorageConfig))
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.productsService.create(createProductDto, file);
  }

  @Get()
  findAll(@Query('iscourse') isCourse?: string) {
    // Convert string query parameter to boolean if present
    const isCourseBoolean = isCourse ? isCourse === 'true' : undefined;
    return this.productsService.findAll(isCourseBoolean);
  }

  @Get('stats/count')
  count(@Query('iscourse') isCourse?: string) {
    const isCourseBoolean = isCourse ? isCourse === 'true' : undefined;
    return this.productsService.count(isCourseBoolean);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Post(':id/upload')
  @UseInterceptors(FileInterceptor('file', fileStorageConfig))
  uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.productsService.uploadImage(id, file);
  }

  @Get('images/:filename')
  async getImage(
    @Param('filename') filename: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { stream, type } = await this.productsService.getImage(filename);
    res.set({
      'Content-Type': type,
      'Content-Disposition': `inline; filename="${filename}"`,
    });
    return new StreamableFile(stream);
  }

 
}
