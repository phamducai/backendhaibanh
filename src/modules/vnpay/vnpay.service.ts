import { Injectable } from '@nestjs/common';
import { UpdateVnpayDto } from './dto/update-vnpay.dto';
import { VnpayService as NestVnpayService } from 'nestjs-vnpay';
@Injectable()
export class VnpayService {
    constructor(private readonly vnpayService: NestVnpayService) {}

  findAll() {
    return this.vnpayService.getBankList();

  }

  findOne(id: number) {
    return this.vnpayService.getBankList();
  }

  update(id: number, updateVnpayDto: UpdateVnpayDto) {
    return this.vnpayService.getBankList();
  }

  remove(id: number) {
    return this.vnpayService.getBankList();
  }
}
