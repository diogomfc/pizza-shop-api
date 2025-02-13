import { pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { relations } from 'drizzle-orm'
import { restaurants } from './restaurantes'
import { orders } from './orders'

export const userRoleEnum = pgEnum('user_role', ['manager', 'customer'])

// Crie uma tabela de usuários
export const users = pgTable('users', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  role: userRoleEnum('role').default('customer').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Crie uma relação entre usuários e pedidos
export const usersRelations = relations(users, ({ one, many }) => {
  return {
    managedRestaurant: one(restaurants, {
      fields: [users.id],
      references: [restaurants.managerId],
      relationName: 'managed_restaurant',
    }),
    orders: many(orders),
  }
})
