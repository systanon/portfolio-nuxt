export class TokenManager {
  private readonly accessToken: Ref<string | null | undefined>

  constructor(acessToken: Ref<string | null | undefined>) {
    this.accessToken = acessToken
  }

  public setToken(token: string) {
    this.accessToken.value = token
  }

  public getToken() {
    return this.accessToken
  }

  public clearToken() {
    this.accessToken.value = null
  }
}
