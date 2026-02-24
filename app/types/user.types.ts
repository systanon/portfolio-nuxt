export type Profile = {
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
export type ProfileUpdateInfo = Partial<
  Omit<Profile, 'id' | 'created_at' | 'updated_at' | 'avatar' | 'birth_date'>
>
