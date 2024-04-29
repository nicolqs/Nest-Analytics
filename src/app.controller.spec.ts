import { Test, TestingModule } from '@nestjs/testing'
import { AppController } from './app.controller'
import { TapAnalyticsService } from './services/tap-analytics.service'
import { SuccessDto } from './data-transfer-object/success.dto'

describe('AppController', () => {
  let appController: AppController
  let tapAnalyticsService: TapAnalyticsService

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: TapAnalyticsService,
          useValue: {
            getCachedOrFetchTaps: jest.fn(() =>
              Promise.resolve('Some analytics data'),
            ),
          },
        },
      ],
    }).compile()

    tapAnalyticsService =
      moduleRef.get<TapAnalyticsService>(TapAnalyticsService)
    appController = moduleRef.get<AppController>(AppController)
  })

  describe('findAll', () => {
    it('should return a SuccessDto with analytics data', async () => {
      const body = {
        startDate: '2023-01-01',
        endDate: '2023-12-22',
        interval: 'quarter',
        teamId: 1,
      }

      const result = await appController.findAll(body)

      expect(result).toBeInstanceOf(SuccessDto)
      expect(result).toEqual(
        new SuccessDto('Successful', 'Some analytics data'),
      )
      expect(tapAnalyticsService.getCachedOrFetchTaps).toHaveBeenCalledWith({
        ...body,
      })
    })
  })
})
