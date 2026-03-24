import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiLog } from './api-logs.entity';
import { ApiLogsService } from './api-logs.service';
import { redisStore } from 'cache-manager-redis-yet'
import { CacheModule } from "@nestjs/cache-manager"


@Module({
    imports: [
        TypeOrmModule.forFeature([ApiLog]),
        CacheModule.registerAsync({
            useFactory: async () => ({
                isGlobal: true,
                store: await redisStore({
                    url: 'redis://localhost:6379',
                    ttl: 60000,
                })
            })
        })
    ],
    exports: [ApiLogsService],
    providers: [ApiLogsService]
})
export class ApiLogsModule {}
