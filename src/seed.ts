import { Module, Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { TypeOrmModule } from '@nestjs/typeorm'
import { dataSourceOptionsModule } from './config/datasource'
import { HashingService } from './services/hashing.service'
import { SeederService } from './services/seed.service'
import { ApiKey } from './entities/api-key.entity'
import { Tap } from './entities/tap.entity'
import { Tag } from './entities/tag.entity'

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptionsModule),
    TypeOrmModule.forFeature([ApiKey, Tap, Tag]),
  ],
  providers: [Logger, HashingService, SeederService],
})
export class SeederModule {}

async function bootstrap() {
  NestFactory.createApplicationContext(SeederModule)
    .then((appContext) => {
      const logger = appContext.get(Logger)
      const seeder = appContext.get(SeederService)
      seeder
        .runSeed()
        .then(() => {
          logger.debug('Seeding complete!')
        })
        .catch((error) => {
          logger.error('Seeding failed!')
          throw error
        })
        .finally(() => appContext.close())
    })
    .catch((error) => {
      throw error
    })
}
bootstrap()
