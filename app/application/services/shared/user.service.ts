import { API_URL } from '~/constants'
import type { HTTPClient } from '~/lib/http.client'
import { AppError, type AppSilentError } from '~/types/app-errors'
import { AppSuccess } from '~/types/app.types'
import type { Profile, ProfileDTO } from '~/types/user.types'

export class UserService {
  private readonly httpClient: HTTPClient
  constructor(httpClient: HTTPClient) {
    this.httpClient = httpClient
  }

  async getProfile(): Promise<AppSuccess<Profile> | AppError | AppSilentError> {
    const url = API_URL.profile
    const result = await this.httpClient.do<Profile>(url, {
      method: 'POST',
      credentials: 'include',
    })
    return result
  }
  async updateProfile(dto: ProfileDTO): Promise<AppError | AppSuccess<null>> {
    const url = API_URL.profile
    const body = JSON.stringify(dto)

    const result = await this.httpClient.do<null>(url, {
      method: 'PATCH',
      credentials: 'include',
      body,
    })
    if (result instanceof AppSuccess) {
      return result
    } else {
      return new AppError(result.message)
    }
  }
}
