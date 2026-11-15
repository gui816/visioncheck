import { expect, test } from '@playwright/test'

test('landing page explains the purpose and limitations', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /Conheça melhor/i })).toBeVisible()
  await expect(page.getByText(/não mede graduação/i)).toBeVisible()
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

test('user completes symbol, directional-pattern and symptom steps and sees detailed report', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Começar avaliação/i }).click()
  await page.getByRole('button', { name: /Preparar dispositivo/i }).click()
  await page.getByRole('button', { name: /Iniciar exercícios/i }).click()

  for (let answer = 0; answer < 60; answer += 1) {
    await page.getByRole('button', { name: 'Direita' }).click()
  }

  await expect(page.getByRole('heading', { name: /Olho direito/i })).toBeVisible()
  await expect(page.getByText(/Padrão 1 de 4/i)).toBeVisible()
  for (let pattern = 0; pattern < 8; pattern += 1) {
    await page.getByRole('button', { name: /Sim, parecem semelhantes/i }).click()
  }

  await expect(page.getByRole('heading', { name: /Como tem sentido a sua visão/i })).toBeVisible()
  await page.getByRole('button', { name: /Ver relatório detalhado/i }).click()

  await expect(page.getByRole('heading', { name: /O seu relatório está pronto/i })).toBeVisible()
  await expect(page.getByRole('heading', { name: /1\. Reconhecimento de símbolos/i })).toBeVisible()
  await expect(page.getByRole('heading', { name: /2\. Observação de padrões direcionais/i })).toBeVisible()
  await expect(page.getByRole('heading', { name: /3\. Sintomas visuais referidos/i })).toBeVisible()
  await expect(page.getByText(/não permitem estimar miopia ou graduação/i)).toBeVisible()
  await expect(page.getByText(/não fornece valores SPH, CYL ou AXIS/i)).toBeVisible()
  await expect(page.getByRole('button', { name: /Imprimir relatório/i })).toBeVisible()
})

test('symptom answers are reflected in the educational interpretation', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Começar avaliação/i }).click()
  await page.getByRole('button', { name: /Preparar dispositivo/i }).click()
  await page.getByRole('button', { name: /Iniciar exercícios/i }).click()
  for (let answer = 0; answer < 60; answer += 1) await page.getByRole('button', { name: 'Direita' }).click()
  for (let pattern = 0; pattern < 8; pattern += 1) await page.getByRole('button', { name: /Sim, parecem semelhantes/i }).click()
  await page.getByRole('button', { name: /Frequentemente desfocada/i }).first().click()
  await page.getByRole('button', { name: /Ver relatório detalhado/i }).click()
  await expect(page.getByText(/referiu episódios de desfocagem/i)).toBeVisible()
})
