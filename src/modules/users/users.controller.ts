import { Controller, Get, Param, NotFoundException, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService
  ) {}

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get('count')
  async count() {
    return this.usersService.count();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  @Post('byemail')
  async findByEmail(@Body() body: { email: string }) {
    const user = await this.usersService.findByEmail(body.email);
    if (!user) {
      return false;
    }
    return true;
  }

  @Post('byphone')
  async findByPhone(@Body() body: { phone: string }) {
    const user = await this.usersService.findByPhone(body.phone);
    if (!user) {
      return false;
    }
    return true;
  }
}
