import { HTTPClient } from '~/lib/http.client'
import { AppError } from '~/types/app-errors'
import { API_URL } from '~/constants/apiUrl'
import type { StatisticDTO } from '~/types/app.types'

export class StatisticService {
  private readonly httpClient: HTTPClient

  constructor(httpClient: HTTPClient) {
    this.httpClient = httpClient
  }

  async save(dto: StatisticDTO): Promise<void | AppError> {
    const blob = await this.httpClient.download(API_URL.statistic, {
      method: 'POST',
      body: dto,
    })

    if (blob instanceof Blob) {
      const url = window.URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = url
      a.download = 'Serhii_Tustanovskyi_CV.pdf'
      a.click()

      window.URL.revokeObjectURL(url)
    } else {
      return new AppError(blob.message)
    }
  }
}
