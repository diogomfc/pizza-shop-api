import Elysia, { t } from 'elysia'

import { eq } from 'drizzle-orm'
import { auth } from '@/http/auth'
import { UnauthorizedError } from '@/http/errors/unauthorized-error'
import { db } from '@/db/connection-db'
import { orders } from '@/db/schema'

export const cancelOrder = new Elysia().use(auth).patch(
  '/orders/:orderId/cancel',
  async ({ getCurrentUser, set, params }) => {
    const { orderId } = params

    const { restauranteId } = await getCurrentUser()
    if (!restauranteId) {
      throw new UnauthorizedError()
    }

    const order = await db.query.orders.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, orderId)
      },
    })
    if (!order) {
      set.status = 400
      return { message: 'Order not found.' }
    }

    // Regra de negócio para cancelar um pedido apenas se ele estiver pendente ou em processamento
    if (!['pending', 'processing'].includes(order.status)) {
      set.status = 400

      return { message: 'You cannot cancel orders after dispatch.' }
    }

    await db
      .update(orders)
      .set({ status: 'canceled' })
      .where(eq(orders.id, orderId))
  },
  {
    params: t.Object({
      orderId: t.String(),
    }),
  },
)
