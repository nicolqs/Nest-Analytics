import {
  Post,
  Body,
  HttpCode,
  UsePipes,
  UseGuards,
  Controller,
  ValidationPipe,
  NotFoundException,
} from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { Guard } from './services/guard.service'
import { TapAnalyticsService } from './services/tap-analytics.service'
import { SuccessDto } from './data-transfer-object/success.dto'
import { TapAnalyticsParams } from './data-transfer-object/tap-analytics-params.dto'
import { THROTTLE_LIMIT, ONE_HOUR_MS } from './utils/constants'

@Controller('v1/api/tap/analytics')
@UseGuards(Guard)
export class AppController {
  constructor(private readonly tapAnalyticsService: TapAnalyticsService) {}

  @Throttle({ default: { limit: THROTTLE_LIMIT, ttl: ONE_HOUR_MS } })
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(200)
  @Post()
  async findAll(
    @Body(new ValidationPipe()) body: TapAnalyticsParams,
  ): Promise<SuccessDto> {
    try {
      return new SuccessDto(
        `Successful`,
        await this.tapAnalyticsService.getCachedOrFetchTaps({
          ...body,
        }),
      )
    } catch (e) {
      throw new NotFoundException(`An error has occured.`)
    }
  }
}
