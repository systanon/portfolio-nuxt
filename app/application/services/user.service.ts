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
    // await delay(5000)
    return this.httpClient.do<Profile>(url, {
      method: 'POST',
      credentials: 'include',
    })
  }
  async updateProfile(dto: ProfileDTO): Promise<AppError | AppSuccess<null>> {
    const url = API_URL.profile
    const body = JSON.stringify(dto)
    return this.httpClient.do<null>(url, {
      method: 'PATCH',
      credentials: 'include',
      body,
    })
  }
}
