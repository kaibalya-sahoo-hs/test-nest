// src/common/middleware/logger.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiLog } from 'src/api-logs/api-logs.entity';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(ApiLog)
    private readonly logRepository: Repository<ApiLog>,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, body } = req;

    res.on('finish', async () => {
      const log = this.logRepository.create({
        method,
        url: originalUrl,
        statusCode: res.statusCode,
        payload: JSON.stringify(body),
      });
      await this.logRepository.save(log);
    });

    next();
  } 
}