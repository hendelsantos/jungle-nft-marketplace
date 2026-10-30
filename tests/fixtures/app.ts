import { expect, type Page } from '@playwright/test'

export async function resetApp(page: Page, scenario = 'default') {
  await page.addInitScript(({ activeScenario }) => {
    if (!localStorage.getItem('jungle:e2e-initialized')) {
      localStorage.clear()
      sessionStorage.clear()
      localStorage.setItem('jungle:scenario', activeScenario)
      localStorage.setItem('jungle:e2e-initialized', 'true')
    }
  }, { activeScenario: scenario })
}

/**
 * Na primeira navegação do contexto, a página ainda não está controlada pelo
 * service worker do MSW, então chamadas diretas a /api/__mock/* podem escapar
 * para o servidor real. Aguarda o worker assumir o controle da página.
 */
export async function waitForMocks(page: Page) {
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null, undefined, { timeout: 10_000 })
}

/**
 * Aguarda o canal Socket.IO estar conectado (marcado em
 * `document.documentElement.dataset.realtime` pelo RealtimeProvider) antes de
 * disparar atualizações de preço, evitando perder o evento.
 */
export async function waitForRealtime(page: Page) {
  await page.waitForFunction(() => document.documentElement.dataset.realtime === 'connected', undefined, { timeout: 10_000 })
}

export async function login(page: Page, email = 'ana@jungle.demo', password = 'Jungle#2026') {
  await page.goto('/login')
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha').fill(password)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL(/\/$/)
}

export async function addFirstNftToCart(page: Page) {
  await page.goto('/')
  await page.getByRole('link', { name: /Ver Jungle Ape Genesis/ }).click()
  await page.getByRole('button', { name: /Adicionar ao carrinho/ }).click()
  await expect(page.getByText('Item adicionado ao carrinho.')).toBeVisible()
}
