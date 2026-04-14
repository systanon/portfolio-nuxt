import type { Ref } from 'vue'
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
import type { ISyncModule } from '~/types/sync'

export class AuthService {
  private readonly httpClient: HTTPClient
  private readonly wsClient: WSClientLike
  private readonly accessToken: Ref<string | null | undefined>
  private readonly syncModule: ISyncModule

  constructor(
    httpClient: HTTPClient,
    wsClient: WSClientLike,
    accessToken: Ref<string | null | undefined>,
    syncModule: ISyncModule,
  ) {
    this.httpClient = httpClient
    this.wsClient = wsClient
    this.accessToken = accessToken
    this.syncModule = syncModule
    this.syncModule.on('login', this.applyToken.bind(this))
    this.syncModule.on('logout', this.applyLogout.bind(this))
  }
  private applyToken({ access_token }: { access_token: string }) {
    this.accessToken.value = access_token
  }

  private applyLogout() {
    this.accessToken.value = null
    this.wsClient.unauth()
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
      this.syncModule.emit('login', { access_token })
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
      this.syncModule.emit('logout')
    } else {
      return new AppError(result.message)
    }
  }
}
