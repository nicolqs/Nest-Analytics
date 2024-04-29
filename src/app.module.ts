import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CacheModule } from '@nestjs/cache-manager'
import { AppService } from './app.service'
import { HashingService } from './services/hashing.service'
import { AppController } from './app.controller'
import { ApiKey } from './entities/api-key.entity'
import { Tap } from './entities/tap.entity'
import { Tag } from './entities/tag.entity'
import { dataSourceOptionsModule } from './config/datasource'
import { TapAnalyticsService } from './services/tap-analytics.service'
import { SseController } from './bonus/sse.controller'

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptionsModule),
    TypeOrmModule.forFeature([ApiKey, Tap, Tag]),
    CacheModule.register(),
  ],
  providers: [AppService, HashingService, TapAnalyticsService],
  controllers: [AppController, SseController],
})
export class AppModule {}
