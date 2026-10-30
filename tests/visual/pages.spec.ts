import { expect, test } from '@playwright/test'
import { addFirstNftToCart, login, resetApp } from '../fixtures/app'

test.beforeEach(async ({ page }) => { await resetApp(page) })

test('home visual', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Jungle Ape Genesis')).toBeVisible()
  await expect(page).toHaveScreenshot('home.png', { fullPage: true })
})

test('NFT detail visual', async ({ page }) => {
  await page.goto('/nfts/nft_1')
  await expect(page.getByRole('heading', { name: 'Jungle Ape Genesis' })).toBeVisible()
  await expect(page).toHaveScreenshot('nft-detail.png', { fullPage: true })
})

test('cart visual', async ({ page }) => {
  await addFirstNftToCart(page)
  await page.goto('/cart')
  await expect(page.getByText('Jungle Ape Genesis')).toBeVisible()
  await expect(page).toHaveScreenshot('cart.png', { fullPage: true })
})

test('checkout visual', async ({ page }) => {
  await login(page)
  await addFirstNftToCart(page)
  await page.goto('/checkout')
  await expect(page.getByRole('heading', { name: 'Finalizar compra' })).toBeVisible()
  await expect(page).toHaveScreenshot('checkout.png', { fullPage: true })
})
