import { apiRequest } from './client'
import type { LoginPayload, SignupPayload } from '../types'

type SignupResponse = {
  message: string
  data: { id: string }
}

type LoginResponse = {
  message: string
  token: string
}

export function signup(payload: SignupPayload) {
  return apiRequest<SignupResponse>('/user/signup', {
    method: 'POST',
    body: payload,
  })
}

export function login(payload: LoginPayload) {
  return apiRequest<LoginResponse>('/user/login', {
    method: 'POST',
    body: payload,
  })
}
