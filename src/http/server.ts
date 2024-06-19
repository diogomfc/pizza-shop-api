import { Elysia } from 'elysia'

import { createRestaurante } from './routes/restaurants/create-restaurant'
import { sendAuthLink } from './routes/auth/send-auth-link'
import { authenticateFromLink } from './routes/auth/authenticate-from-link'
import { signOut } from './routes/auth/sign-out'
import { getProfile } from './routes/profile/get-profile'
import { getManagedRestaurante } from './routes/restaurants/get-managed-restaurante'
import { getOrderDetails } from './routes/orders/get-order-details'
import { approveOrder } from './routes/orders/approve-order'
import { dispatchOrder } from './routes/orders/dispatch-order'
import { deliverOrder } from './routes/orders/deliver-order'
import { cancelOrder } from './routes/orders/cancel-order'
// import { UnauthorizedError } from './errors/unauthorized-error'

const app = new Elysia()
  .use(createRestaurante)
  .use(sendAuthLink)
  .use(authenticateFromLink)
  .use(signOut)
  .use(getProfile)
  .use(getManagedRestaurante)
  .use(getOrderDetails)
  .use(approveOrder)
  .use(dispatchOrder)
  .use(deliverOrder)
  .use(cancelOrder)
  .onError(({ code, error, set }) => {
    switch (code) {
      case 'VALIDATION': {
        set.status = error.status

        return error.toResponse()
      }
      default: {
        console.error(error)

        return new Response(null, { status: 500 })
      }
    }
  })

// .error({
//   UNAUTHORIZED: UnauthorizedError,
// })
// .onError(({ code, error, set }) => {
//   switch (code) {
//     case 'UNAUTHORIZED': {
//       set.status = 401
//       return { code, message: error.message }
//     }
//     case 'VALIDATION': {
//       set.status = error.status

//       return error.toResponse()
//     }
//     case 'NOT_FOUND': {
//       return new Response(null, { status: 404 })
//     }
//     default: {
//       console.error(error)

//       return new Response(null, { status: 500 })
//     }
//   }
// })
// .use(
//   cors({
//     credentials: true,
//     allowedHeaders: ['content-type'],
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
//     origin: (request): boolean => {
//       const origin = request.headers.get('origin')

//       if (!origin) {
//         return false
//       }

//       return true
//     },
//   }),
// )

app.listen(3333, () => {
  console.log('🔥 HTTP server running!')
})
