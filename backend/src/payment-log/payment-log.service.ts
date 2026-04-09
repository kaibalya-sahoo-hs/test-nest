import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentLogs } from './payment-log.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PaymentLogService {
    constructor(
        @InjectRepository(PaymentLogs)
        private paymentLogRepo: Repository<PaymentLogs>
    ){}

    async getAllLogs(paymentId){
        return await this.paymentLogRepo.find({where: {payment: {id: paymentId}}})
    }

    async createLog(paymentId, status){
        const newPaymentLog = await this.paymentLogRepo.create({paymentStatus: status, payment: {id: paymentId}})
        this.paymentLogRepo.save(newPaymentLog)
        return {success: true, message: "New payment log created", newPaymentLog}
    }
}
