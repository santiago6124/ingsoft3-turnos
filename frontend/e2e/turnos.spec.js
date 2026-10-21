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

// Red de seguridad: si un flujo falla a mitad de camino, borra por API lo que haya quedado con su
// DNI. El borrado que se PRUEBA es el de la pantalla; éste sólo evita ensuciar QA.
async function limpiarPorDni (request, dni) {
  const r = await request.get(`${API}/api/turnos`, { params: { search: dni } })
  for (const t of await r.json()) await request.delete(`${API}/api/turnos/${t.id}`)
  const despues = await request.get(`${API}/api/turnos`, { params: { search: dni } })
  expect(await despues.json()).toHaveLength(0)
}

test('un ciudadano saca un turno, el admin lo ve y lo elimina', async ({ page, request }) => {
  const nombre = `e2e ${unico()}`
  const dni = dniUnico()
  try {
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
  } finally {
    await limpiarPorDni(request, dni)
  }
})

test('elegir un sábado muestra el aviso, no deja agendar y no crea nada', async ({ page, request }) => {
  const dni = dniUnico()

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
  const dni = dniUnico()
  // El turno pendiente lo prepara la API: lo que se prueba es la pantalla del admin.
  const alta = await request.post(`${API}/api/turnos`, {
    data: { citizenName: nombre, nationalId: dni, scheduledAt: `${diaHabil()}T10:30:00`, serviceType: 'Radicación' },
  })
  expect(alta.status()).toBe(201)
  const { id } = await alta.json()

  try {
    await abrirAdmin(page, dni)
    const fila = page.getByRole('row').filter({ hasText: nombre })
    await expect(fila).toContainText('Pendiente')
    await page.getByRole('button', { name: `Confirmar turno de ${nombre}` }).click()
    await expect(fila).toContainText('Confirmado')

    await page.reload()
    await abrirAdmin(page, dni)
    await expect(page.getByRole('row').filter({ hasText: nombre })).toContainText('Confirmado')
  } finally {
    expect((await request.delete(`${API}/api/turnos/${id}`)).status()).toBe(204)
    const r = await request.get(`${API}/api/turnos`, { params: { search: dni } })
    expect(await r.json()).toHaveLength(0)
  }
})
