import { Module } from '@nestjs/common';
import { VnpayModule as NestVnpayModule } from 'nestjs-vnpay';
import { ignoreLogger } from 'vnpay';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { VnpayController } from './vnpay.controller';
import { VnpayService } from './vnpay.service';
@Module({
  imports: [
    ConfigModule.forRoot({
        envFilePath: '.env',
    }),
    NestVnpayModule.registerAsync({
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
            secureSecret: 'YLBWWQIGHKLLLYEBEMLPSA1XU6W8FOH7',
            tmnCode: '68BKYXF1',
            loggerFn: ignoreLogger,
        }),
        inject: [ConfigService],
    }),
],
  controllers: [VnpayController],
  providers: [VnpayService],
  exports: [VnpayModule], // Xuất module để có thể sử dụng ở các module khác
})
export class VnpayModule {}