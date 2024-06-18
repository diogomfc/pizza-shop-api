import { Elysia, t } from 'elysia'
import jwt from '@elysiajs/jwt'
import cookie from '@elysiajs/cookie'

import { createRestaurante } from './routes/restaurants/create-restaurant'
import { sendAuthLink } from './routes/auth/send-auth-link'
import { env } from '@/env'

const app = new Elysia()
  .use(
    jwt({
      secret: env.JWT_SECRET_KEY,
      schema: t.Object({
        sub: t.String(),
        restauranteId: t.Optional(t.String()),
      }),
    }),
  )
  .use(cookie())
  .use(createRestaurante)
  .use(sendAuthLink)

app.listen(3333, () => {
  console.log('🔥 HTTP server running!')
})
