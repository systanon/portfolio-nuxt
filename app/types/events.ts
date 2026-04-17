import type { Profile } from '~/types/user.types'
import type { PaginateResult } from '~/types/app.types'
import type { Todo } from '~/types/todo'

export interface BaseEventTypes {
  'profile:loaded': [profile: Profile]
  'auth:login': []
  'auth:logout': []
  'data:loading': [isLoading: boolean]
  'todo:loaded': [result: PaginateResult<Todo>]
}
