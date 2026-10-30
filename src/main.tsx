import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppProviders } from '@/app/providers/app-providers'
import { startMocking } from '@/mocks/start'
import '@/styles/globals.css'

async function bootstrap() {
  await startMocking()
  const root = document.getElementById('root')
  if (!root) throw new Error('Root element not found')
  createRoot(root).render(<StrictMode><AppProviders /></StrictMode>)
}

void bootstrap()
