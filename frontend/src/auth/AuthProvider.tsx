import { useEffect, useState, type ReactNode } from 'react'
import {
  clearStoredToken,
  getStoredToken,
  setStoredToken,
  setUnauthorizedHandler,
} from '../api/client'
import { AuthContext, decodeJwtEmail } from './AuthContext'

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(() => getStoredToken())

  const logout = () => {
    clearStoredToken()
    setToken(null)
  }

  const login = (nextToken: string) => {
    setStoredToken(nextToken)
    setToken(nextToken)
  }

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearStoredToken()
      setToken(null)
    })
    return () => setUnauthorizedHandler(null)
  }, [])

  const email = token ? decodeJwtEmail(token) : null

  return (
    <AuthContext.Provider
      value={{
        token,
        email,
        isAuthenticated: Boolean(token),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
