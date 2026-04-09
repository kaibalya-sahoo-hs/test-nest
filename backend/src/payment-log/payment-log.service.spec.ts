import { Test, TestingModule } from '@nestjs/testing';
import { PaymentLogService } from './payment-log.service';

describe('PaymentLogService', () => {
  let service: PaymentLogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentLogService],
    }).compile();

    service = module.get<PaymentLogService>(PaymentLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
