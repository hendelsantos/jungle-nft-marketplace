export async function startMocking() {
  if (import.meta.env.VITE_ENABLE_MOCKS === 'false') return
  const { worker } = await import('./browser')
  await worker.start({ onUnhandledRequest: 'bypass', serviceWorker: { url: '/mockServiceWorker.js' } })
}
