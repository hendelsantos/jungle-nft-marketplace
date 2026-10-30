import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppProviders } from '@/app/providers/app-providers'
import { startMocking } from '@/mocks/start'
import '@/styles/globals.css'

// Top-level await: o evento `load` do documento só dispara depois que o MSW
// estiver ativo, garantindo que qualquer requisição externa já seja interceptada.
await startMocking()

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(<StrictMode><AppProviders /></StrictMode>)
