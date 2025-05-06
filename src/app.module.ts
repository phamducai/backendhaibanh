import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './database/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    UsersModule, 
    PrismaModule, 
    AuthModule, 
    ConfigModule.forRoot({isGlobal:true})
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
