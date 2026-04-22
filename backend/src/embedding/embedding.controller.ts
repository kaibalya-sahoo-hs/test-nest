import { Controller, Get, Param } from '@nestjs/common';
import { EmbeddingService } from './embedding.service';

@Controller('embedding')
export class EmbeddingController {
    constructor(private embeddingService: EmbeddingService){}
    @Get(':text')
    async getEmbedding(@Param('text') text: string) {
        const embedding = await this.embeddingService.createEmbedding(text);
        return {embedding, success: true};
    }
}
