import { Module } from '@nestjs/common';
import { UserproductsService } from './userproducts.service';
import { UserproductsController } from './userproducts.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [UserproductsController],
  providers: [UserproductsService],
})
export class UserproductsModule {}
