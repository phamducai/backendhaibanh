import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './database/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { ChaptersModule } from './modules/chapters/chapters.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { UserproductsModule } from './modules/userproducts/userproducts.module';
import { ContactModule } from './modules/contact/contact.module';

@Module({
  imports: [
    UsersModule, 
    PrismaModule, 
    AuthModule, 
    ProductsModule,
    ConfigModule.forRoot({isGlobal:true}),
    ChaptersModule,
    LessonsModule,
    UserproductsModule,
    ContactModule
    ],
  controllers: [],
  providers: [],
})
export class AppModule {}
