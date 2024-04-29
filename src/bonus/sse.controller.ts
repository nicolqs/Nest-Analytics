import { Controller, Get, MessageEvent, Res, Sse } from '@nestjs/common'
import { Response } from 'express'
import { readFileSync } from 'fs'
import { join } from 'path'
import { interval, Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { TapAnalyticsService } from 'src/services/tap-analytics.service'

/**
 * Bonus: Propose a method for streaming tap data in real-time to the frontend.
 *
 * Simple example of Server-Sent Events usage
 * Visit http://localhost:3000/
 *
 * Steps:
 * - The frontend will get the little snippet in index.html
 * - Then it will establish a connection with EventSource() to handle receiving server-sent events to `/sse`
 * - Will keep receiving sample data at a 1 sec interval
 *
 */
@Controller()
export class SseController {
  constructor(private readonly tapAnalyticsService: TapAnalyticsService) {}

  @Get()
  index(@Res() response: Response) {
    response
      .type('text/html')
      .send(readFileSync(join(__dirname, 'index.html')).toString())
  }

  @Sse('sse')
  async sse(): Promise<Observable<MessageEvent>> {
    /**
     * Sample Tap Analytics query
     * Interval is set to 1sec
     */
    const data = await this.tapAnalyticsService.getCachedOrFetchTaps({
      startDate: '2023-10-20', // ideally start today
      endDate: '2023-10-25', // would be now, current time
      interval: 'hour', // minute or hour would be a great choice to visualize real-time data
      teamId: 1,
    })
    return interval(1000).pipe(map(() => ({ data }) as MessageEvent))
  }
}
