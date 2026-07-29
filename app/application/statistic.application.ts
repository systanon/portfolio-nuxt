import { AppError } from '~/types/app-errors'
import type { StatisticDTO } from '~/types/app.types'
import type { StatisticService } from './services/statistic.service'
import type { NotificationModule } from './modules/notification/notification.module'

export class StatisticApplication {
  private statisticService: StatisticService
  private notifier: NotificationModule

  constructor(statisticService: StatisticService, notifier: NotificationModule) {
    this.statisticService = statisticService
    this.notifier = notifier
  }

  async save(dto: StatisticDTO): Promise<void | AppError> {
    const res = await this.statisticService.save(dto)
    if (res instanceof AppError) {
      this.notifier.notify('error', res.message)
    }
    return res
  }
}
