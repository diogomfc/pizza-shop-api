import Elysia, { t } from 'elysia'

import { and, count, eq, getTableColumns, ilike } from 'drizzle-orm'
import { auth } from '@/http/auth'
import { UnauthorizedError } from '@/http/errors/unauthorized-error'
import { db } from '@/db/connection-db'
import { orders, users } from '@/db/schema'
import { createSelectSchema } from 'drizzle-typebox'

export const getOrders = new Elysia().use(auth).get(
  '/orders',
  async ({ getCurrentUser, query }) => {
    const { customerName, orderId, status, pageIndex } = query

    const { restauranteId } = await getCurrentUser()
    if (!restauranteId) {
      throw new UnauthorizedError()
    }

    const orderTableColumns = getTableColumns(orders)

    // Query para buscar os pedidos do restaurante
    const baseQuery = db
      .select(orderTableColumns)
      .from(orders)
      .innerJoin(users, eq(users.id, orders.customerId))
      .where(
        and(
          eq(orders.restaurantId, restauranteId),
          orderId ? ilike(orders.id, `%${orderId}%`) : undefined,
          status ? eq(orders.status, status) : undefined,
          customerName ? ilike(users.name, `%${customerName}%`) : undefined,
        ),
      )

    // Query para buscar a quantidade total de pedidos e os pedidos paginados
    const [amountOfOrdersQuery, allOrders] = await Promise.all([
      db.select({ count: count() }).from(baseQuery.as('baseQuery')),
      db
        .select()
        .from(baseQuery.as('baseQuery'))
        .offset(pageIndex * 10)
        .limit(10),
    ])

    const amountOfOrders = amountOfOrdersQuery[0].count

    return {
      orders: allOrders,
      meta: {
        pageIndex,
        perPage: 10,
        totalCount: amountOfOrders,
      },
    }
  },
  {
    query: t.Object({
      customerName: t.Optional(t.String()),
      orderId: t.Optional(t.String()),
      status: t.Optional(createSelectSchema(orders).properties.status),
      pageIndex: t.Numeric({ minimum: 0 }),
    }),
  },
)
