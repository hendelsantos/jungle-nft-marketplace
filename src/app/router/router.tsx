import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router'
import type { JSX } from 'react'
import { RootLayout } from '@/app/layouts/root-layout'
import { ProtectedRoute } from '@/features/auth/protected-route'
import { CartPage } from '@/routes/cart-page'
import { CheckoutPage } from '@/routes/checkout-page'
import { FavoritesPage } from '@/routes/favorites-page'
import { HomePage, parseHomeSearch } from '@/routes/home-page'
import { LoginPage } from '@/routes/login-page'
import { NftDetailPage } from '@/routes/nft-detail-page'
import { NotFoundPage } from '@/routes/not-found-page'
import { OrderPage } from '@/routes/order-page'
import { ProfilePage } from '@/routes/profile-page'
import { RegisterPage } from '@/routes/register-page'
import { WalletsPage } from '@/routes/wallets-page'

const rootRoute = createRootRoute({ component: RootLayout, notFoundComponent: NotFoundPage })
const homeRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', validateSearch: parseHomeSearch, component: HomePage })
const nftRoute = createRoute({ getParentRoute: () => rootRoute, path: '/nfts/$nftId', component: NftDetailPage })
const cartRoute = createRoute({ getParentRoute: () => rootRoute, path: '/cart', component: CartPage })
const loginRoute = createRoute({ getParentRoute: () => rootRoute, path: '/login', validateSearch: (search: Record<string, unknown>) => typeof search.redirect === 'string' ? { redirect: search.redirect } : {}, component: LoginPage })
const registerRoute = createRoute({ getParentRoute: () => rootRoute, path: '/register', validateSearch: (search: Record<string, unknown>) => typeof search.redirect === 'string' ? { redirect: search.redirect } : {}, component: RegisterPage })
const protectedComponent = (Component: () => JSX.Element) => () => <ProtectedRoute><Component /></ProtectedRoute>
const favoritesRoute = createRoute({ getParentRoute: () => rootRoute, path: '/favorites', component: protectedComponent(FavoritesPage) })
const checkoutRoute = createRoute({ getParentRoute: () => rootRoute, path: '/checkout', component: protectedComponent(CheckoutPage) })
const orderRoute = createRoute({ getParentRoute: () => rootRoute, path: '/orders/$orderId', component: protectedComponent(OrderPage) })
const profileRoute = createRoute({ getParentRoute: () => rootRoute, path: '/profile', component: protectedComponent(ProfilePage) })
const walletsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/wallets', component: protectedComponent(WalletsPage) })

const routeTree = rootRoute.addChildren([homeRoute, nftRoute, cartRoute, loginRoute, registerRoute, favoritesRoute, checkoutRoute, orderRoute, profileRoute, walletsRoute])

export const router = createRouter({ routeTree, defaultPreload: 'intent', defaultPreloadStaleTime: 30_000, scrollRestoration: true })

declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}
