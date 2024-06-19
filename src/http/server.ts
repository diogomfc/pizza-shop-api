import { Elysia } from 'elysia'

import { createRestaurante } from './routes/restaurants/create-restaurant'
import { sendAuthLink } from './routes/auth/send-auth-link'
import { authenticateFromLink } from './routes/auth/authenticate-from-link'
import { signOut } from './routes/auth/sign-out'
import { getProfile } from './routes/profile/get-profile'
import { getManagedRestaurante } from './routes/restaurants/get-managed-restaurante'

const app = new Elysia()
  .use(createRestaurante)
  .use(sendAuthLink)
  .use(authenticateFromLink)
  .use(signOut)
  .use(getProfile)
  .use(getManagedRestaurante)

app.listen(3333, () => {
  console.log('🔥 HTTP server running!')
})
