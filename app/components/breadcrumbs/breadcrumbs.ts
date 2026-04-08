import { useTodoStore } from '~/store/todo'

export type BreadcrumbLabel = string | (() => string)

export type BreadcrumbsItem = {
  id: number
  parentId: number | null
  path: string
  name: string
  label: BreadcrumbLabel
  disabled?: boolean
}

export type Breadcrumbs = BreadcrumbsItem[]

export const breadcrumbsConfig: Breadcrumbs = [
  {
    id: 0,
    parentId: null,
    path: '/todos',
    name: 'TodoList',
    label: 'Todos',
  },
  {
    id: 1,
    parentId: 0,
    path: '/todos/:id',
    name: 'TodoDetail',
    label: () => useTodoStore().currentTodo?.title || 'Todo title',
  },
  {
    id: 2,
    parentId: null,
    path: '/sign-in',
    name: 'SignIn',
    label: 'Sign In',
  },
  {
    id: 3,
    parentId: 2,
    path: '/forgot-password',
    name: 'ForgotPassword',
    label: 'Forgot Password',
  },
  {
    id: 4,
    parentId: 3,
    path: '/resend-email-verification',
    name: 'ResendEmailVerification',
    label: 'Resend Email Verification',
  },
]
