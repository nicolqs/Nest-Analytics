import { Inject, Injectable } from '@nestjs/common'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { HashingService } from './hashing.service'
import { Tap } from '../entities/tap.entity'
import { ApiKey } from '../entities/api-key.entity'
import { getCacheTime } from '../utils'
import { ONE_DAY_MS } from '../utils/constants'

type TapsFilterType = {
  startDate: string
  endDate: string
  interval: string
  teamId: number
}

@Injectable()
export class TapAnalyticsService {
  constructor(
    private readonly hashingService: HashingService,
    @InjectRepository(Tap) private readonly tapRepository: Repository<Tap>,
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: Repository<ApiKey>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getCachedOrFetchTaps(filters: TapsFilterType): Promise<Tap[]> {
    const { startDate, endDate, interval, teamId } = filters

    // Get cache
    const cacheKey = `${startDate}-${endDate}-${interval}-${teamId}`
    const cachedTaps: Tap[] = await this.cacheManager.get(cacheKey)
    if (cachedTaps) {
      return Promise.resolve(cachedTaps)
    }

    // Fetch data & set cache
    const taps = await this.getTapsFromDb({ ...filters, teamId })
    await this.cacheManager.set(cacheKey, taps, getCacheTime(new Date(endDate)))

    return taps
  }

  async getTapsFromDb(filters: TapsFilterType): Promise<Tap[]> {
    const { startDate, endDate, interval, teamId } = filters

    const query = this.tapRepository
      .createQueryBuilder('t')
      .select(`DATE_TRUNC('${interval}', t.createdAt)`, 'period')
      .addSelect('SUM(t.count)', 'total_count')
      .innerJoin('t.tag', 'tg', 't.tagUid = tg.tagUid')
      .where('t.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('tg.teamId = :teamId', { teamId })
      .groupBy('period')
      .orderBy('period')
    return await query.getRawMany()
  }

  async getCachedOrFetchKey(key: string): Promise<ApiKey> | null {
    const hashedKey = this.hashingService.hashApiKey(key)

    // Get cache
    const cacheKey = `api-key-${hashedKey}`
    const cachedApiKey: ApiKey = await this.cacheManager.get(cacheKey)
    if (cachedApiKey) {
      return Promise.resolve(cachedApiKey)
    }

    // Fetch key
    const findOneOptions = { where: { key: hashedKey } }
    const apiKeyEntity = await this.apiKeyRepository.findOne(findOneOptions)
    if (!apiKeyEntity) return null

    // Set Cache
    await this.cacheManager.set(cacheKey, apiKeyEntity, ONE_DAY_MS)

    return apiKeyEntity
  }
}
