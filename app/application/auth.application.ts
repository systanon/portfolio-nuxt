import { AppSuccess } from '~/types/app.types'
import type { AuthService } from './services/auth.service'
import type { UserService } from './services/user.service'
import type { TokenManager } from './token.manager'
import type { AuthResponse, SignUpDto } from '~/types/auth'
import { AppError, AppSilentError } from '~/types/app-errors'
import type { Profile } from '~/types/user.types'

export class AuthApplication {
  private authService: AuthService
  private tokenManager: TokenManager
  private userService: UserService

  constructor(
    authService: AuthService,
    userService: UserService,
    tokenManager: TokenManager,
  ) {
    this.authService = authService
    this.userService = userService
    this.tokenManager = tokenManager
  }

  public async signIn(
    dto: SignUpDto,
  ): Promise<AppSuccess<Profile> | AppError | AppSilentError> {
    const response = await this.authService.authorization(dto)
    if (response instanceof AppSuccess) {
      const { data } = response
      this.tokenManager.setToken(data.access_token)
      const userResponse = await this.userService.getProfile()
      if (userResponse instanceof AppSuccess) {
        return userResponse
      }
      return userResponse
    }

    return response
  }

  public async signUp(dto: SignUpDto): Promise<AppSuccess | AppError> {
    return await this.authService.registration(dto)
  }

  public async confirmEmail(
    params: Parameters<AuthService['confirmEmail']>[0],
  ): Promise<AppSuccess<AuthResponse> | AppError> {
    return await this.authService.confirmEmail(params)
  }

  public async resendConfirmEmail(
    dto: Parameters<AuthService['resendConfirmEmail']>[0],
  ): Promise<AppSuccess | AppError> {
    return await this.authService.resendConfirmEmail(dto)
  }

  public async forgotPassword(
    dto: Parameters<AuthService['forgotPassword']>[0],
  ): Promise<AppSuccess | AppError> {
    return await this.authService.forgotPassword(dto)
  }

  public async resetPassword(
    dto: Parameters<AuthService['resetPassword']>[0],
  ): Promise<AppSuccess | AppError> {
    return await this.authService.resetPassword(dto)
  }

  public async refresh(): Promise<AppSuccess<AuthResponse> | AppError> {
    const response = await this.authService.refresh()
    if (response instanceof AppSuccess) {
      const { data } = response
      this.tokenManager.setToken(data.access_token)
    }
    return response
  }

  public async logout(): Promise<AppSuccess | AppError> {
    const response = await this.authService.logout()
    if (response instanceof AppSuccess) {
      this.tokenManager.clearToken()
    }
    return response
  }
}
