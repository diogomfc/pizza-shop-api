import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { restaurants, orderItems } from '.'
import { relations } from 'drizzle-orm'

// Crie uma tabela de  produtos
export const products = pgTable('products', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  priceInCents: integer('price_in_cents').notNull(),
  restaurantId: text('restaurant_id')
    .notNull()
    .references(() => restaurants.id, {
      onDelete: 'cascade',
    }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Crie uma relação entre produtos, restaurantes e itens de pedidos
export const productsRelations = relations(products, ({ one, many }) => {
  return {
    restaurant: one(restaurants, {
      fields: [products.restaurantId],
      references: [restaurants.id],
      relationName: 'product_restaurant',
    }),
    orderItems: many(orderItems),
  }
})
