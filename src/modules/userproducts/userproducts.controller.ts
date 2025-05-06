import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserproductsService } from './userproducts.service';
import { CreateUserProductDto } from './dto/create-userproduct.dto';
import { UpdateUserproductDto } from './dto/update-userproduct.dto';

@Controller('userproducts')
export class UserproductsController {
  constructor(private readonly userproductsService: UserproductsService) {}

  @Post()
  create(@Body() createUserProductDto: CreateUserProductDto) {
    return this.userproductsService.create(createUserProductDto);
  }

  @Get()
  findAll() {
    return this.userproductsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userproductsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserProductDto: UpdateUserproductDto) {
    return this.userproductsService.update(id, updateUserProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userproductsService.remove(id);
  }
}
