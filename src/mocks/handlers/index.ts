import { accountHandlers } from './account'
import { authHandlers } from './auth'
import { cartHandlers } from './cart'
import { favoriteHandlers } from './favorites'
import { nftHandlers } from './nfts'
import { orderHandlers } from './orders'
import { quoteHandlers } from './quotes'
import { systemHandlers } from './system'
import { realtimeHandler } from '@/mocks/realtime/handler'

export const handlers = [
  ...systemHandlers,
  ...authHandlers,
  ...nftHandlers,
  ...favoriteHandlers,
  ...cartHandlers,
  ...quoteHandlers,
  ...orderHandlers,
  ...accountHandlers,
  realtimeHandler,
]
