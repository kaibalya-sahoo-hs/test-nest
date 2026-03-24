import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Repository } from 'typeorm';
import { ApiLog } from './api-logs.entity';
import * as cacheManager from 'cache-manager'

@Injectable()
export class ApiLogsService {
    constructor(
        @InjectRepository(ApiLog)
        private readonly apiLogRepo: Repository<ApiLog>,

        @Inject(CACHE_MANAGER)
        private cacheManager: cacheManager.Cache,
    ) { }
    async getAllLogs() {
        try {
            const REDIS_APIKEY = process.env.REDIS_APIKEY
            if (REDIS_APIKEY) {
                const cachedLogs = await this.cacheManager.get(REDIS_APIKEY);
                console.log("Cached logs are showing")
                if (cachedLogs) {
                    return {success: true, logs: cachedLogs};
                }
                const logs = await this.apiLogRepo.find({ order: { createdAt: 'DESC' }, take: 20 })
                await this.cacheManager.set(REDIS_APIKEY, logs, 30000);
                return { success: true, logs }
            }

        } catch (error) {
            console.log('Error while fetching logs', error)
            return { message: "Error while fetching logs", success: true }
        }
    }
}
