import { Module } from '@nestjs/common';
import { PaymentLogService } from './payment-log.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentLogs } from './payment-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentLogs])],
  providers: [PaymentLogService],
  exports: [PaymentLogService]
})
export class PaymentLogModule { }
