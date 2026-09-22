import { hashPassword } from '../utils/hash'
import { createUser, getUserByEmail } from '../services/user.service'

/** Local/dev login helper — created automatically on server start if missing. */
export const DUMMY_USER = {
  firstName: 'Demo',
  lastName: 'User',
  email: 'demo@shortly.app',
  password: 'password123',
} as const

export async function ensureDummyUser() {
  const existing = await getUserByEmail(DUMMY_USER.email)
  if (existing) {
    console.log(`Dummy user ready: ${DUMMY_USER.email} / ${DUMMY_USER.password}`)
    return
  }

  const { salt, password: hashedPassword } = hashPassword(DUMMY_USER.password)
  await createUser({
    firstName: DUMMY_USER.firstName,
    lastName: DUMMY_USER.lastName,
    email: DUMMY_USER.email,
    hashedPassword,
    salt,
  })

  console.log(`Dummy user created: ${DUMMY_USER.email} / ${DUMMY_USER.password}`)
}
