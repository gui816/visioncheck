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
  await expect(page.getByRole('img', { name: 'Símbolo E em orientação aleatória' })).toBeVisible()
  await expect(page.locator('.tumbling-e rect')).toHaveCount(4)
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


test('setup records distance, brightness and optional camera guidance in the report', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Começar avaliação/i }).click()
  await page.getByRole('button', { name: /Preparar dispositivo/i }).click()
  await page.getByRole('button', { name: /Medi 40 cm/i }).click()
  await page.getByRole('button', { name: /Ajustei o brilho/i }).click()
  await expect(page.getByText(/não deteta o rosto nem mede a distância/i)).toBeVisible()
  await expect(page.getByRole('button', { name: /Ativar pré-visualização da câmara/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /Iniciar exercícios/i })).toBeVisible()
})


test('Tumbling E keeps a 5 by 5 vector geometry across stimulus sizes', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Começar avaliação/i }).click()
  await page.getByRole('button', { name: /Preparar dispositivo/i }).click()
  await page.getByRole('button', { name: /Iniciar exercícios/i }).click()
  const optotype = page.getByRole('img', { name: 'Símbolo E em orientação aleatória' })
  await expect(optotype).toHaveAttribute('viewBox', '0 0 5 5')
  await expect(optotype.locator('rect')).toHaveCount(4)
  await expect(optotype).toHaveCSS('fill', 'rgb(16, 16, 16)')
})


test('each optotype size uses a balanced set of four orientations', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Começar avaliação/i }).click()
  await page.getByRole('button', { name: /Preparar dispositivo/i }).click()
  await page.getByRole('button', { name: /Iniciar exercícios/i }).click()

  const observed = new Map<string, string[]>()
  for (let answer = 0; answer < 60; answer += 1) {
    const symbol = page.getByRole('img', { name: 'Símbolo E em orientação aleatória' })
    const width = await symbol.evaluate((element) => (element as SVGSVGElement).style.width)
    const rotation = await symbol.evaluate((element) => (element as SVGSVGElement).style.transform)
    observed.set(width, [...(observed.get(width) ?? []), rotation])
    await page.getByRole('button', { name: 'Direita' }).click()
  }

  expect(observed.size).toBe(6)
  for (const rotations of observed.values()) {
    const counts = [...new Set(rotations)].map((rotation) => rotations.filter((value) => value === rotation).length)
    expect(rotations).toHaveLength(5)
    expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(1)
    expect(counts.length).toBe(4)
  }
})
