export type Gender = 'male' | 'female'

export interface Spouse {
  name?: string
  gender?: Gender
  birthDate?: string
  deathDate?: string
  relationship?: 'wife' | 'husband'
  bio?: string
  avatar?: string
}

export interface Member {
  id: string
  name: string
  gender: Gender
  birthDate?: string
  deathDate?: string
  generation?: number
  generationName?: string
  avatar?: string
  bio?: string
  spouseId?: string | null
  fatherId?: string | null
  motherId?: string | null
  childrenIds: string[]
  createdAt: string
  updatedAt: string
  spouse?: Spouse
}

export interface FamilyData {
  version: string
  lastModified: string
  familyName: string
  rootMemberId?: string
  members: Member[]
}

