import Elysia from 'elysia'

import { and, eq, gte, sql, sum } from 'drizzle-orm'
import { auth } from '@/http/auth'
import { UnauthorizedError } from '@/http/errors/unauthorized-error'
import { db } from '@/db/connection-db'
import { orders } from '@/db/schema'
import dayjs from 'dayjs'

export const getMonthRevenue = new Elysia()
  .use(auth)
  .get('/metrics/month-revenue', async ({ getCurrentUser }) => {
    const { restauranteId } = await getCurrentUser()
    if (!restauranteId) {
      throw new UnauthorizedError()
    }

    const today = dayjs() // dia atual
    const lastMonth = today.subtract(1, 'month') // mês passado
    const startOfLastMonth = lastMonth.startOf('month') // mês passado, primeiro dia

    const monthsRevenues = await db
      .select({
        monthWithYear: sql<string>`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`,
        revenue: sum(orders.totalInCents).mapWith(Number),
      })
      .from(orders)
      .where(
        and(
          eq(orders.restaurantId, restauranteId),
          gte(orders.createdAt, startOfLastMonth.toDate()),
        ),
      )
      .groupBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`)

    const currentMonthWithYear = today.format('YYYY-MM') // mês atual
    const lastMonthWithYear = lastMonth.format('YYYY-MM') //  mês passado

    // Encontra o faturamento do mês atual
    const currentMonthRevenue = monthsRevenues.find((monthRevenue) => {
      return monthRevenue.monthWithYear === currentMonthWithYear
    })

    // Encontra o faturamento do mês passado
    const lastMonthRevenue = monthsRevenues.find((monthRevenue) => {
      return monthRevenue.monthWithYear === lastMonthWithYear
    })

    // Calcula a diferença percentual do faturamento do mês atual em relação ao mês passado
    const diffFromLastMonth =
      currentMonthRevenue && lastMonthRevenue
        ? (currentMonthRevenue.revenue * 100) / lastMonthRevenue.revenue
        : null

    return {
      revenue: currentMonthRevenue?.revenue || 0,
      diffFromLastMonth: diffFromLastMonth
        ? Number((diffFromLastMonth - 100).toFixed(2))
        : 0,
    }
  })
