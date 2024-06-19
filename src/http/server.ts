import { Elysia } from 'elysia'

import { createRestaurante } from './routes/restaurants/create-restaurant'
import { sendAuthLink } from './routes/auth/send-auth-link'
import { authenticateFromLink } from './routes/auth/authenticate-from-link'

const app = new Elysia()
  .use(createRestaurante)
  .use(sendAuthLink)
  .use(authenticateFromLink)

app.listen(3333, () => {
  console.log('🔥 HTTP server running!')
})
