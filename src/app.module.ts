import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './database/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';

@Module({
  imports: [
    UsersModule, 
    PrismaModule, 
    AuthModule, 
    ProductsModule,
    ConfigModule.forRoot({isGlobal:true}), 
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
