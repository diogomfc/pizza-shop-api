import Elysia, { t } from 'elysia'

import { eq } from 'drizzle-orm'
import { db } from '@/db/connection-db'
import { auth } from '@/http/auth'
import { authLinks } from '@/db/schema'
import dayjs from 'dayjs'

export const authenticateFromLink = new Elysia().use(auth).get(
  '/auth-links/authenticate',
  async ({ query, signUser, set }) => {
    const { code, redirect } = query

    // Verificar se o código existe no banco de dados
    const authLinkFromCode = await db.query.authLinks.findFirst({
      where(fields, { eq }) {
        return eq(fields.code, code)
      },
    })

    if (!authLinkFromCode) {
      throw new Error('Auth link not found.')
    }

    // Verificar se o link expirou
    const daysSinceAuthLinkWasCreated = dayjs().diff(
      authLinkFromCode.createdAt,
      'days',
    )

    if (daysSinceAuthLinkWasCreated > 7) {
      throw new Error('Auth link expired, please generate a new one.')
    }

    // Verificar se o usuário é um gerente de restaurante
    const managedRestaurante = await db.query.restaurants.findFirst({
      where(fields, { eq }) {
        return eq(fields.managerId, authLinkFromCode.userId)
      },
    })

    await signUser({
      sub: authLinkFromCode.userId,
      restauranteId: managedRestaurante?.id,
    })

    // Gerar um token JWT
    // const token = await jwt.sign({
    //   sub: authLinkFromCode.userId,
    //   restauranteId: managedRestaurante?.id,
    // })

    // Setar o token JWT no cookie
    // auth.set({
    //   httpOnly: true,
    //   maxAge: 60 * 60 * 24 * 7, // 7 dias
    //   path: '/',
    //   value: token,
    // })

    // Deletar o link de autenticação
    await db.delete(authLinks).where(eq(authLinks.code, code))

    // Redirecionar o usuário para a URL original
    set.redirect = redirect
  },
  {
    query: t.Object({
      code: t.String(),
      redirect: t.String(),
    }),
  },
)
