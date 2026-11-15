import { expect, test } from '@playwright/test'

test('landing page explains the purpose and limitations', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /Cuide da sua visão/i })).toBeVisible()
  await expect(page.getByText(/não substitui uma consulta/i)).toBeVisible()
})

test('user can prepare the device and begin the guided exercises', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Começar avaliação/i }).click()
  await expect(page.getByRole('heading', { name: /Vamos preparar a avaliação/i })).toBeVisible()
  await page.getByRole('button', { name: /Preparar dispositivo/i }).click()
  await expect(page.getByRole('heading', { name: /Ajuste a escala do ecrã/i })).toBeVisible()
  await page.getByRole('button', { name: /Iniciar exercícios/i }).click()
  await expect(page.getByRole('heading', { name: /Olho direito/i })).toBeVisible()
  await expect(page.getByLabel('Símbolo E em orientação aleatória')).toBeVisible()
})

test('user can complete both guided exercises and view a non-clinical summary', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Começar avaliação/i }).click()
  await page.getByRole('button', { name: /Preparar dispositivo/i }).click()
  await page.getByRole('button', { name: /Iniciar exercícios/i }).click()

  for (let answer = 0; answer < 12; answer += 1) {
    await page.getByRole('button', { name: 'Direita' }).click()
  }

  await expect(page.getByRole('heading', { name: /Observe as linhas/i })).toBeVisible()
  await page.getByRole('button', { name: /Sim, parecem semelhantes/i }).click()
  await page.getByRole('button', { name: /Sim, parecem semelhantes/i }).click()

  await expect(page.getByRole('heading', { name: /A sua sessão está concluída/i })).toBeVisible()
  await expect(page.getByText(/não representa uma medição clínica/i)).toBeVisible()
  await expect(page.getByText(/A contagem de acertos não equivale a uma escala clínica como 6\/6/i)).toBeVisible()
  await expect(page.getByText(/acertos/i).first()).toBeVisible()
  await expect(page.getByRole('button', { name: /Repetir sessão/i })).toBeVisible()
})
