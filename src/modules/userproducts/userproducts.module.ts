import { Module } from '@nestjs/common';
import { UserproductsService } from './userproducts.service';
import { UserproductsController } from './userproducts.controller';

@Module({
  controllers: [UserproductsController],
  providers: [UserproductsService],
})
export class UserproductsModule {}
