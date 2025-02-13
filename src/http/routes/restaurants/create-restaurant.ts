import { Elysia, t } from 'elysia'

import { db } from '@/db/connection-db'
import { restaurants, users } from '@/db/schema'

export const createRestaurante = new Elysia().post(
  '/restaurantes',
  async ({ body, set }) => {
    const { restaurantName, managerName, email, phone } = body

    const [manager] = await db
      .insert(users)
      .values({
        name: managerName,
        email,
        phone,
        role: 'manager',
      })
      .returning({
        id: users.id,
      })

    await db.insert(restaurants).values({
      name: restaurantName,
      managerId: manager.id,
    })

    set.status = 204
  },
  {
    body: t.Object({
      restaurantName: t.String(),
      managerName: t.String(),
      phone: t.String(),
      email: t.String({
        format: 'email',
        errorMessage: { format: 'must be a valid email address' },
      }),
    }),
  },
)
