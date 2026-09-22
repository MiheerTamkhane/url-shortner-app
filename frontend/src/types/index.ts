export type UrlRecord = {
  id: string
  userId: string
  targetURL: string
  shortCode: string
  createdAt: string
  updatedAt: string
}

export type ShortenResult = {
  id: string
  targetURL: string
  shortCode: string
}

export type SignupPayload = {
  firstName: string
  lastName?: string
  email: string
  password: string
}

export type LoginPayload = {
  email: string
  password: string
}
