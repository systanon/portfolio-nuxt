export type DBEntity = {
  id: number
  user_id: number
  createdAt: string
  updatedAt: string
}

export type CreateNoteDTO = {
  title: string
  description: string
}

export type CreateNoteResponse = {
  id: number
}

export type UpdateNoteDTO = Partial<CreateNoteDTO>
export type ReplaceNoteDTO = Required<CreateNoteDTO>

export type Note = DBEntity & CreateNoteDTO
