// Integración (TP7): la API de QA DESPLEGADA, con su Postgres de verdad detrás.
// Sin navegador (fixture `request`: un cliente HTTP) y sin ningún doble: si el código le manda a
// la base algo que Postgres rechaza, esto se pone rojo; un unitario con mock daría verde.
import { expect, test } from '@playwright/test'
import { diaHabil, dniUnico, horario, unico } from './datos.js'

// La API tiene su propia dirección: NO es la del front. Sin barra al final.
const API = process.env.API_BASE_URL || 'http://localhost:8080'

function turno (extra = {}) {
  return {
    citizenName: `api ${unico()}`,
    nationalId: dniUnico(),
    scheduledAt: `${diaHabil()}T${horario()}:00`,
    serviceType: 'Pasaporte',
    ...extra,
  }
}

// La lista filtrada por DNI: cada prueba usa uno único, así encuentra sólo lo suyo.
async function buscar (request, dni) {
  const r = await request.get(`${API}/api/turnos`, { params: { search: dni } })
  expect(r.status()).toBe(200)
  return await r.json()
}

test('el alta guarda en la base de verdad, y el borrado la saca', async ({ request }) => {
  const datos = turno()

  const alta = await request.post(`${API}/api/turnos`, { data: datos })
  expect(alta.status()).toBe(201)
  const creado = await alta.json()
  expect(creado.status).toBe('Pending')

  // El GET le pregunta a Postgres, no a un doble: el turno tiene que estar con lo que mandamos.
  const encontrados = await buscar(request, datos.nationalId)
  expect(encontrados).toHaveLength(1)
  expect(encontrados[0].citizenName).toBe(datos.citizenName)
  expect(encontrados[0].scheduledAt).toBe(datos.scheduledAt)

  const borrado = await request.delete(`${API}/api/turnos/${creado.id}`)
  expect(borrado.status()).toBe(204)

  expect(await buscar(request, datos.nationalId)).toHaveLength(0)
})

// Dos formas de pedir un turno que no corresponde: la API contesta 400 y no guarda nada.
for (const [caso, extra] of [
  ['una fecha pasada', { scheduledAt: '2020-03-02T10:00:00' }],
  ['un nombre vacío', { citizenName: '' }],
]) {
  test(`un alta con ${caso} la rechaza la API, y no crea nada`, async ({ request }) => {
    const datos = turno(extra)

    const alta = await request.post(`${API}/api/turnos`, { data: datos })
    expect(alta.status()).toBe(400)

    expect(await buscar(request, datos.nationalId)).toHaveLength(0)
  })
}

// La regla que más importa en una oficina de turnos: un horario confirmado no se puede volver a
// dar. La sostienen el controller Y un índice único parcial de Postgres; esta prueba pasa por los dos.
test('un horario confirmado no se puede volver a reservar, y figura ocupado', async ({ request }) => {
  const primero = turno()
  const [dia, hora] = primero.scheduledAt.split('T')

  const alta = await request.post(`${API}/api/turnos`, { data: primero })
  expect(alta.status()).toBe(201)
  const creado = await alta.json()

  try {
    const confirmado = await request.put(`${API}/api/turnos/${creado.id}/confirmar`)
    expect(confirmado.status()).toBe(200)

    const segundo = turno({ scheduledAt: primero.scheduledAt })
    const choque = await request.post(`${API}/api/turnos`, { data: segundo })
    expect(choque.status()).toBe(409)
    expect(await buscar(request, segundo.nationalId)).toHaveLength(0)

    const grilla = await request.get(`${API}/api/available-slots`, { params: { date: dia, serviceType: 'Pasaporte' } })
    expect(grilla.status()).toBe(200)
    const slot = (await grilla.json()).find((s) => s.startTime === hora)
    expect(slot.available).toBe(false)
  } finally {
    // Limpia aunque una aserción haya fallado: QA lo comparten todas las corridas.
    expect((await request.delete(`${API}/api/turnos/${creado.id}`)).status()).toBe(204)
    expect(await buscar(request, primero.nationalId)).toHaveLength(0)
  }
})
