import { Elysia } from 'elysia'
import { registerRestaurante } from './routes/register-restaurant'

const app = new Elysia().use(registerRestaurante)

app.listen(3333, () => {
  console.log('🔥 HTTP server running!')
})
