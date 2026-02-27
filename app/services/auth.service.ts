import type { HTTPClient } from '@/lib/http.client'
import { AppError, AppRateLimitError, AppSilentError } from '@/types/app-errors'
import type {
  AuthResponse,
  ConfirmQuery,
  ForgotPasswordDto,
  ResendConfirmEmailDto,
  ResetPasswordDto,
  SignInDto,
  SignUpDto,
} from '~/types/auth'
import { API_URL } from '@/constants'
import { AppSuccess } from '~/types/app.types'
import type { Profile, ProfileUpdateInfo } from '~/types/user.types'

export class AuthService {
  private readonly httpClient: HTTPClient
  private readonly httpClientRefresh: HTTPClient

  constructor(httpClient: HTTPClient, httpClientRefresh: HTTPClient) {
    this.httpClient = httpClient
    this.httpClientRefresh = httpClientRefresh
  }

  async registration(dto: SignUpDto): Promise<AppSuccess | AppError> {
    const url = API_URL.auth.sign_up
    const body = JSON.stringify(dto)
    return await this.httpClient.do(url, {
      method: 'POST',
      body,
      credentials: 'include',
    })
  }

  async confirmEmail(params: ConfirmQuery): Promise<void | AppError> {
    const response = await this.httpClient.do<AuthResponse>(
      API_URL.auth.confirm,
      {
        method: 'POST',
        params,
      },
    )
    if (response instanceof AppSuccess) {
      const access_token = response.data.access_token
      const token = useCookie('access_token')
      token.value = access_token
    } else {
      return new AppError(response.message)
    }
  }

  async resendConfirmEmail(
    dto: ResendConfirmEmailDto,
  ): Promise<AppSuccess | AppError | AppRateLimitError> {
    const url = API_URL.auth.resendEmail
    const body = JSON.stringify(dto)

    return await this.httpClient.do(url, {
      method: 'POST',
      body,
    })
  }

  async forgotPassword(
    dto: ForgotPasswordDto,
  ): Promise<AppSuccess | AppError | AppRateLimitError> {
    const url = API_URL.auth.forgotPass
    const body = JSON.stringify(dto)

    return await this.httpClient.do(url, {
      method: 'POST',
      body,
    })
  }

  async resetPassword(dto: ResetPasswordDto): Promise<AppSuccess | AppError> {
    const url = API_URL.auth.resetPass
    const body = JSON.stringify(dto)
    return await this.httpClient.do(url, {
      method: 'POST',
      body,
    })
  }

  async authorization(dto: SignInDto): Promise<void | AppError> {
    const url = API_URL.auth.sign_in
    const body = JSON.stringify(dto)

    const result = await this.httpClient.do<AuthResponse>(url, {
      method: 'POST',
      body,
      credentials: 'include',
    })

    if (result instanceof AppSuccess) {
      const access_token = result.data.access_token
      const token = useCookie('access_token')
      token.value = access_token
    } else {
      return new AppError(result.message)
    }
  }

  async getProfile(): Promise<AppSuccess<Profile> | AppError | AppSilentError> {
    const url = API_URL.auth.profile
    const result = await this.httpClient.do<Profile>(url, {
      method: 'POST',
      credentials: 'include',
    })
    return result
  }

  async updateProfile(dto: ProfileUpdateInfo): Promise<AppError | string> {
    const url = API_URL.auth.profile
    const body = JSON.stringify(dto)

    const result = await this.httpClient.do(url, {
      method: 'PATCH',
      credentials: 'include',
      body,
    })
    if (result instanceof AppSuccess) {
      return result.message
    } else {
      return new AppError(result.message)
    }
  }

  async refresh(): Promise<AppSuccess<AuthResponse> | AppError> {
    const url = API_URL.auth.refresh
    const response = await this.httpClientRefresh.do<AuthResponse>(url, {
      method: 'POST',
      credentials: 'include',
    })
    if (response instanceof AppSuccess) {
      const access_token = response.data.access_token
      useCookie('access_token').value = access_token
      return response
    } else {
      return new AppError(response.message)
    }
  }

  async logout(): Promise<void | AppError> {
    const url = API_URL.auth.logout
    const result = await this.httpClient.do(url, {
      method: 'POST',
      credentials: 'include',
    })
    if (result instanceof AppSuccess) {
      const accessToken = useCookie('access_token')
      accessToken.value = null
    } else {
      return new AppError(result.message)
    }
  }
}
