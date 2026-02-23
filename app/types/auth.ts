export type SignUpDto = {
  email: string
  password: string
}

export type SignInDto = SignUpDto

export type AuthResponse = {
  access_token: string
}

export type ConfirmQuery = {
  token: string
}

export type AuthRequest = AuthResponse

export type RegistrationResponse = {
  message: string
}

export type ResendConfirmEmailDto = {
  email: string
}

export type ForgotPasswordDto = ResendConfirmEmailDto

export type ResetPasswordDto = {
  password: string
  token: string
}

export type SuccessResponse = RegistrationResponse

export type UserProfile = {
  id: number
  email: string
  phone: string
  first_name: string
  last_name: string
  bio: string
  birth_date: string
  avatar: string
  created_at: string
  updated_at: string
}
//TODO:use correct formating for birth_date
export type UserProfileUpdateInfo = Partial<
  Omit<
    UserProfile,
    'id' | 'created_at' | 'updated_at' | 'avatar' | 'birth_date'
  >
>
