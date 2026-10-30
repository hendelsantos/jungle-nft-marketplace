import axios from 'axios'
import { normalizeApiError } from '@/api/errors/api-error'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  timeout: 12_000,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const sessionId = localStorage.getItem('jungle:session-id')
  const anonymousCartId = localStorage.getItem('jungle:anonymous-cart-id')
  if (sessionId) config.headers.set('Authorization', `Bearer ${sessionId}`)
  if (anonymousCartId) config.headers.set('X-Anonymous-Cart-Id', anonymousCartId)
  const scenario = localStorage.getItem('jungle:scenario')
  if (scenario) config.headers.set('X-Mock-Scenario', scenario)
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(normalizeApiError(error)),
)
