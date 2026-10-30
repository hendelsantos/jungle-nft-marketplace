import { Outlet } from '@tanstack/react-router'
import { AppFooter } from '@/components/layout/app-footer'
import { AppHeader } from '@/components/layout/app-header'

export function RootLayout() {
  return <><AppHeader /><main id="main-content" tabIndex={-1}><Outlet /></main><AppFooter /></>
}
