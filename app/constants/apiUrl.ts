type Mode = 'production' | 'development'

const mode = import.meta.env.MODE as Mode

export const API_URL = {
  production: {
    auth: {
      sign_up: '/api/v1/auth/sign-up',
      sign_in: '/api/v1/auth/sign-in',
      profile: '/api/v1/auth/profile',
      refresh: '/api/v1/auth/refresh',
      confirm: '/api/v1/auth/confirm',
      logout: '/api/v1/auth/logout',
      resendEmail: '/api/v1/auth/resend-verification',
      forgotPass: '/api/v1/auth/forgot-password',
      resetPass: '/api/v1/auth/reset-password',
    },
    notes: '/api/v1/notes',
    todos: '/api/v1/todos',
    statistic: '/api/v1/cv/download',
  },
  development: {
    auth: {
      sign_up: '/api/auth/sign-up',
      sign_in: '/api/auth/sign-in',
      profile: '/api/auth/profile',
      refresh: '/api/auth/refresh',
      confirm: '/api/auth/confirm',
      logout: '/api/auth/logout',
      resendEmail: '/api/auth/resend-verification',
      forgotPass: '/api/auth/forgot-password',
      resetPass: '/api/auth/reset-password',
    },
    notes: '/api/notes',
    todos: '/api/todos',
    statistic: '/api/cv/download',
  },
}[mode]
