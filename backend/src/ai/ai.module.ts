import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { ProductModule } from 'src/product/product.module';

@Module({
  imports: [ProductModule],
  providers: [AiService],
  controllers: [AiController]
})
export class AiModule {}
