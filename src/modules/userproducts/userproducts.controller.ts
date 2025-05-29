import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { UserproductsService } from './userproducts.service';
import { UpdateUserproductDto } from './dto/update-userproduct.dto';
import { CreateUserProductDto } from './dto/create-userproduct.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';

@Controller('userproducts')
export class UserproductsController {
  constructor(  private readonly userproductsService: UserproductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: any, @Body() createUserProductDto: CreateUserProductDto) {
    return this.userproductsService.create(createUserProductDto, user);
  }

  @Get()
  findAll() {
    return this.userproductsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userproductsService.findOne(id);
  }

  @Get('userid/id')
  @UseGuards(JwtAuthGuard)
  findUserProductByUserId(@CurrentUser() user: any,@Query('status') status: boolean) {
    return this.userproductsService.findUserProductByUserId(user?.sub,status);
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
