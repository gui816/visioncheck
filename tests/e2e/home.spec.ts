import { expect, test } from '@playwright/test'

test('landing page explains the purpose and limitations', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /Cuide da sua visão/i })).toBeVisible()
  await expect(page.getByText(/não substitui uma consulta/i)).toBeVisible()
})

test('user can open the preparation screen', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Começar avaliação/i }).click()
  await expect(page.getByRole('heading', { name: /Vamos preparar a avaliação/i })).toBeVisible()
})
