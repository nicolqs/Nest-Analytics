import {
  IsNotEmpty,
  IsDateString,
  IsString,
  IsIn,
  IsNumber,
} from 'class-validator'
import { allowedIntervals } from '../utils'

export class TapAnalyticsParams {
  @IsNotEmpty()
  @IsString()
  @IsIn(allowedIntervals)
  interval: string

  @IsNotEmpty()
  @IsDateString()
  startDate: string

  @IsNotEmpty()
  @IsDateString()
  endDate: string

  @IsNumber()
  teamId: number
}
