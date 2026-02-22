export type DBEntity = {
  id: number
  created_at: string
  updated_at: string
}

export type TodoDTO = Pick<Todo, 'title' | 'description'>

export type CreateTodoDTO = {
  title: string
  description: string
  completed?: boolean
}

export interface CreateTodoResponse {
  id: number
}

export type UpdateTodoDTO = Partial<CreateTodoDTO>
export type ReplaceTodoDTO = Required<CreateTodoDTO>

export type Todo = {
  title: string
  description: string
  completed: boolean
} & DBEntity
