import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { TapAnalyticsService } from './tap-analytics.service'

@Injectable()
export class Guard implements CanActivate {
  constructor(private readonly tapAnalyticsService: TapAnalyticsService) {}

  /**
   * canActivate - require an API key to access
   *
   * @param context
   * @returns Promise<boolean> whether a given request will be authorized
   *          by the route handler or respond a 403
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const reqApiKey = req.headers['x-api-key']
    if (!reqApiKey) {
      return false
    }

    // Fetch ApiKey
    const apiKey = await this.tapAnalyticsService.getCachedOrFetchKey(reqApiKey)
    if (apiKey === null) {
      return false
    }
    req.body.teamId = apiKey.teamId // Attach corresponding teamId

    // Authorize only if Api Key exists
    return true
  }
}
