import { Elysia } from 'elysia'

import { createRestaurante } from './routes/restaurants/create-restaurant'

const app = new Elysia().use(createRestaurante)

app.listen(3333, () => {
  console.log('🔥 HTTP server running!')
})
