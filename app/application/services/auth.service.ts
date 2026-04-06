import type { HTTPClient } from '~/lib/http.client'
import { AppError, AppRateLimitError } from '~/types/app-errors'
import type {
  AuthResponse,
  ConfirmQuery,
  ForgotPasswordDto,
  ResendConfirmEmailDto,
  ResetPasswordDto,
  SignInDto,
  SignUpDto,
} from '~/types/auth'
import { API_URL } from '~/constants'
import { AppSuccess } from '~/types/app.types'
import type { WSClientLike } from '~/lib/ws.client'
import type { CookieRef } from '#app'

export class AuthService {
  private readonly httpClient: HTTPClient
  private readonly wsClient: WSClientLike
  private readonly accessToken: CookieRef<string | null | undefined>

  constructor(
    httpClient: HTTPClient,
    wsClient: WSClientLike,
    accessToken: CookieRef<string | null | undefined>,
  ) {
    this.httpClient = httpClient
    this.wsClient = wsClient
    this.accessToken = accessToken
  }

  async registration(dto: SignUpDto): Promise<AppSuccess | AppError> {
    const url = API_URL.sign_up
    const body = JSON.stringify(dto)
    return await this.httpClient.do(url, {
      method: 'POST',
      body,
    })
  }

  async confirmEmail(params: ConfirmQuery): Promise<void | AppError> {
    const response = await this.httpClient.do<AuthResponse>(API_URL.confirm, {
      method: 'POST',
      params,
    })
    if (response instanceof AppSuccess) {
      const access_token = response.data.access_token
      this.accessToken.value = access_token
    } else {
      return new AppError(response.message)
    }
  }

  async resendConfirmEmail(
    dto: ResendConfirmEmailDto,
  ): Promise<AppSuccess | AppError | AppRateLimitError> {
    const url = API_URL.resendEmail
    const body = JSON.stringify(dto)

    return await this.httpClient.do(url, {
      method: 'POST',
      body,
    })
  }

  async forgotPassword(
    dto: ForgotPasswordDto,
  ): Promise<AppSuccess | AppError | AppRateLimitError> {
    const url = API_URL.forgotPass
    const body = JSON.stringify(dto)

    return await this.httpClient.do(url, {
      method: 'POST',
      body,
    })
  }

  async resetPassword(dto: ResetPasswordDto): Promise<AppSuccess | AppError> {
    const url = API_URL.resetPass
    const body = JSON.stringify(dto)
    return await this.httpClient.do(url, {
      method: 'POST',
      body,
    })
  }

  async authorization(dto: SignInDto): Promise<void | AppError> {
    const url = API_URL.sign_in
    const body = JSON.stringify(dto)

    const result = await this.httpClient.do<AuthResponse>(url, {
      method: 'POST',
      body,
    })

    if (result instanceof AppSuccess) {
      const access_token = result.data.access_token
      this.accessToken.value = access_token
    } else {
      return new AppError(result.message)
    }
  }

  async refresh(): Promise<AppSuccess<AuthResponse> | AppError> {
    const url = API_URL.refresh
    const response = await this.httpClient.do<AuthResponse>(url, {
      method: 'POST',
    })
    if (response instanceof AppSuccess) {
      const access_token = response.data.access_token
      this.accessToken.value = access_token
      return response
    } else {
      return new AppError(response.message)
    }
  }

  async logout(): Promise<void | AppError> {
    const url = API_URL.logout
    const result = await this.httpClient.do(url, {
      method: 'POST',
      credentials: 'include',
    })
    if (result instanceof AppSuccess) {
      this.accessToken.value = null
      this.wsClient.unauth()
    } else {
      return new AppError(result.message)
    }
  }
}
