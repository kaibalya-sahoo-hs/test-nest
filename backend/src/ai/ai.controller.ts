import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
    constructor(private aiService: AiService){}
    @Post()
    async getResponse(@Body() body: any){
        return await this.aiService.getAiResponse(body.msg)
    }
}
