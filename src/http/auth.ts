import { Elysia, t, type Static } from 'elysia'
import jwt from '@elysiajs/jwt'

import { env } from '../env'

const jwtPayload = t.Object({
  sub: t.String(),
  restauranteId: t.Optional(t.String()),
})

export const auth = new Elysia()
  .use(
    jwt({
      secret: env.JWT_SECRET_KEY,
      schema: jwtPayload,
    }),
  )
  .derive({ as: 'scoped' }, ({ jwt, cookie: { auth } }) => {
    return {
      signUser: async (payload: Static<typeof jwtPayload>) => {
        // Gerar um token JWT
        const token = await jwt.sign(payload)

        // Setar o token JWT no cookie
        auth.set({
          httpOnly: true,
          maxAge: 60 * 60 * 24 * 7, // 7 dias
          path: '/',
          value: token,
        })
      },

      signOut: async () => {
        auth.remove()
      },
    }
  })
