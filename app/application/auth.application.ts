import { AppSuccess } from '~/types/app.types'
import type { AuthService } from './services/auth.service'
import type { UserService } from './services/user.service'
import type { TokenManager } from './token.manager'
import type { AuthResponse, SignUpDto } from '~/types/auth'
import { AppBaseError, AppError, AppSilentError } from '~/types/app-errors'
import type { Profile } from '~/types/user.types'
import type { NotificationModule } from './modules/notification/notification.module'

export class AuthApplication {
  private authService: AuthService
  private tokenManager: TokenManager
  private userService: UserService
  private notifier: NotificationModule

  constructor(
    authService: AuthService,
    userService: UserService,
    tokenManager: TokenManager,
    notifier: NotificationModule,
  ) {
    this.authService = authService
    this.userService = userService
    this.tokenManager = tokenManager
    this.notifier = notifier
  }

  private notifyError(res: AppBaseError) {
    this.notifier.notify(res.type === 'silent' ? 'info' : 'error', res.message)
  }

  public async signIn(
    dto: SignUpDto,
  ): Promise<AppSuccess<Profile> | AppError | AppSilentError> {
    const response = await this.authService.authorization(dto)
    if (response instanceof AppError) {
      this.notifyError(response)
      return response
    }

    const { data } = response
    this.tokenManager.setToken(data.access_token)
    const userResponse = await this.userService.getProfile()
    if (userResponse instanceof AppBaseError) {
      this.notifyError(userResponse)
    }
    return userResponse
  }

  public async signUp(dto: SignUpDto): Promise<AppSuccess | AppError> {
    const response = await this.authService.registration(dto)
    if (response instanceof AppError) {
      this.notifyError(response)
    }
    return response
  }

  public async confirmEmail(
    params: Parameters<AuthService['confirmEmail']>[0],
  ): Promise<AppSuccess<AuthResponse> | AppError> {
    const response = await this.authService.confirmEmail(params)
    if (response instanceof AppError) {
      this.notifyError(response)
    }
    return response
  }

  public async resendConfirmEmail(
    dto: Parameters<AuthService['resendConfirmEmail']>[0],
  ): Promise<AppSuccess | AppError> {
    const response = await this.authService.resendConfirmEmail(dto)
    if (response instanceof AppBaseError) {
      this.notifyError(response)
    }
    return response
  }

  public async forgotPassword(
    dto: Parameters<AuthService['forgotPassword']>[0],
  ): Promise<AppSuccess | AppError> {
    const response = await this.authService.forgotPassword(dto)
    if (response instanceof AppBaseError) {
      this.notifyError(response)
    }
    return response
  }

  public async resetPassword(
    dto: Parameters<AuthService['resetPassword']>[0],
  ): Promise<AppSuccess | AppError> {
    const response = await this.authService.resetPassword(dto)
    if (response instanceof AppError) {
      this.notifyError(response)
    }
    return response
  }

  public async refresh(): Promise<AppSuccess<AuthResponse> | AppError> {
    const response = await this.authService.refresh()
    if (response instanceof AppSuccess) {
      const { data } = response
      this.tokenManager.setToken(data.access_token)
    } else {
      this.notifyError(response)
    }
    return response
  }

  public async logout(): Promise<AppSuccess | AppError> {
    const response = await this.authService.logout()
    if (response instanceof AppSuccess) {
      this.tokenManager.clearToken()
    } else {
      this.notifyError(response)
    }
    return response
  }
}
