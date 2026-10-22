// e2e (TP7): Chromium usando el front de QA como una persona. Le pega a la API de verdad: nada de
// page.route ni mocks. Cada flujo interactúa, afirma sobre el dato que él mismo produjo, y limpia.
import { expect, test } from '@playwright/test'
import { diaHabil, dniUnico, sabado, unico } from './datos.js'

const API = process.env.API_BASE_URL || 'http://localhost:8080'

// Abre el panel del admin y filtra por el DNI del test (la búsqueda espera 300 ms antes de pedir).
async function abrirAdmin (page, dni) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Vista administrador' }).click()
  await page.getByLabel('Buscar por nombre o DNI').fill(dni)
}

// Red de seguridad: cada flujo anota el DNI que usa, y después de CADA test (pasó, falló o se cortó
// por tiempo) se borra por API todo lo que haya quedado con ese DNI, y se comprueba. Va en un
// afterEach y no en un `finally`: cuando un test llega a su tope, Playwright cierra su contexto y un
// `finally` ya no puede hablar con la API (nos pasó en la corrida roja del TP7). El borrado que se
// PRUEBA es el de la pantalla; éste sólo evita ensuciar QA, que comparten todas las corridas.
function usarDni (dni) {
  test.info().annotations.push({ type: 'dni', description: dni })
  return dni
}

test.afterEach(async ({ request }, testInfo) => {
  for (const { description: dni } of testInfo.annotations.filter((a) => a.type === 'dni')) {
    const r = await request.get(`${API}/api/turnos`, { params: { search: dni } })
    for (const t of await r.json()) await request.delete(`${API}/api/turnos/${t.id}`)
    const despues = await request.get(`${API}/api/turnos`, { params: { search: dni } })
    expect(await despues.json()).toHaveLength(0)
  }
})

test('un ciudadano saca un turno, el admin lo ve y lo elimina', async ({ page }) => {
  const nombre = `e2e ${unico()}`
  const dni = usarDni(dniUnico())

  await page.goto('/')
  await page.getByRole('button', { name: 'Agendar Pasaporte' }).click()
  await page.getByLabel('Nombre del ciudadano').fill(nombre)
  await page.getByLabel('DNI').fill(dni)
  await page.getByLabel('Fecha', { exact: true }).fill(diaHabil())
  // Los horarios llegan de la API: esperar a que haya uno libre y elegir el primero.
  const horario = page.getByLabel('Horario')
  const primerLibre = horario.locator('option:not([disabled])').first()
  await expect(primerLibre).toBeAttached()
  await horario.selectOption(await primerLibre.getAttribute('value'))
  await page.getByRole('button', { name: 'Agendar turno' }).click()

  await expect(page.getByRole('heading', { name: 'Turno agendado' })).toBeVisible()
  await expect(page.getByText(nombre)).toBeVisible()

  await abrirAdmin(page, dni)
  await expect(page.getByRole('cell', { name: nombre, exact: true })).toBeVisible()
  await page.getByRole('button', { name: `Eliminar turno de ${nombre}` }).click()
  await expect(page.getByRole('cell', { name: nombre, exact: true })).toHaveCount(0)
})

test('elegir un sábado muestra el aviso, no deja agendar y no crea nada', async ({ page, request }) => {
  const dni = usarDni(dniUnico())

  await page.goto('/')
  await page.getByRole('button', { name: 'Agendar Pasaporte' }).click()
  await page.getByLabel('Nombre del ciudadano').fill(`e2e ${unico()}`)
  await page.getByLabel('DNI').fill(dni)
  await page.getByLabel('Fecha', { exact: true }).fill(sabado())

  await expect(page.getByRole('alert')).toContainText('solo de lunes a viernes')
  await expect(page.getByLabel('Horario').locator('option:not([disabled])')).toHaveCount(0)
  await page.getByRole('button', { name: 'Agendar turno' }).click()
  await expect(page.getByRole('heading', { name: 'Turno agendado' })).toHaveCount(0)

  // Y del lado de la base, de verdad no hay nada con ese DNI.
  const r = await request.get(`${API}/api/turnos`, { params: { search: dni } })
  expect(await r.json()).toHaveLength(0)
})

// El flujo de todos los días del admin: confirmar los pendientes. Si mañana no anda, los
// ciudadanos se quedan sin turno confirmado y llaman.
test('el admin confirma un turno pendiente, y sigue confirmado al recargar', async ({ page, request }) => {
  const nombre = `e2e ${unico()}`
  const dni = usarDni(dniUnico())
  // El turno pendiente lo prepara la API: lo que se prueba es la pantalla del admin.
  const alta = await request.post(`${API}/api/turnos`, {
    data: { citizenName: nombre, nationalId: dni, scheduledAt: `${diaHabil()}T10:30:00`, serviceType: 'Radicación' },
  })
  expect(alta.status()).toBe(201)

  await abrirAdmin(page, dni)
  const fila = page.getByRole('row').filter({ hasText: nombre })
  await expect(fila).toContainText('Pendiente')
  await page.getByRole('button', { name: `Confirmar turno de ${nombre}` }).click()
  await expect(fila).toContainText('Confirmado')

  await page.reload()
  await abrirAdmin(page, dni)
  await expect(page.getByRole('row').filter({ hasText: nombre })).toContainText('Confirmado')
})
