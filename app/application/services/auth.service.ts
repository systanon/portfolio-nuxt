import type { HTTPClient } from '~/lib/http.client'
import type { AppRateLimitError } from '~/types/app-errors';
import { AppError } from '~/types/app-errors'
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

export class AuthService {
  private readonly httpClient: HTTPClient

  constructor(httpClient: HTTPClient) {
    this.httpClient = httpClient
  }

  async registration(dto: SignUpDto): Promise<AppSuccess | AppError> {
    const url = API_URL.sign_up
    const body = JSON.stringify(dto)
    return await this.httpClient.do(url, {
      method: 'POST',
      body,
    })
  }

  async confirmEmail(
    params: ConfirmQuery,
  ): Promise<AppSuccess<AuthResponse> | AppError> {
    const response = await this.httpClient.do<AuthResponse>(API_URL.confirm, {
      method: 'POST',
      params,
    })
    if (response instanceof AppSuccess) {
      return response
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

  async authorization(
    dto: SignInDto,
  ): Promise<AppSuccess<AuthResponse> | AppError> {
    const url = API_URL.sign_in
    const body = JSON.stringify(dto)

    const result = await this.httpClient.do<AuthResponse>(url, {
      method: 'POST',
      body,
    })

    if (result instanceof AppSuccess) {
      return result
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
      return response
    } else {
      return new AppError(response.message)
    }
  }

  async logout(): Promise<AppSuccess | AppError> {
    const url = API_URL.logout
    const result = await this.httpClient.do(url, {
      method: 'POST',
      credentials: 'include',
    })
    if (result instanceof AppSuccess) {
      return result
    } else {
      return new AppError(result.message)
    }
  }
}
