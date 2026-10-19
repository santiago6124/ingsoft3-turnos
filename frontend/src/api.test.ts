// @vitest-environment node
// Unit tests without a DOM: this file only exercises logic, so it runs on plain Node
// instead of the jsdom the component tests need.
import { describe, it, expect, vi } from 'vitest'
import { buildAppointmentsQuery, request, type Fetcher } from './api'

describe('buildAppointmentsQuery', () => {
  it.each([
    ['sin filtros', {}, ''],
    ['un filtro', { status: 'Pending' }, '?status=Pending'],
    ['los cuatro, en el orden de la API', { status: 'Confirmed', date: '2026-10-21', serviceType: 'Pasaporte', search: 'ruiz' },
      '?status=Confirmed&date=2026-10-21&serviceType=Pasaporte&search=ruiz'],
    ['filtros vacíos se omiten', { status: '', search: '' }, ''],
    ['espacios y tildes se codifican', { serviceType: 'Cédula de identidad' }, '?serviceType=C%C3%A9dula+de+identidad'],
  ])('%s', (_caso, filtros, esperado) => {
    expect(buildAppointmentsQuery(filtros)).toBe(esperado)
  })
})

// A double for the HTTP client: vi.fn() records how it was called, and each test
// decides what the "server" answers. No network, no backend running.
function fakeFetch(status: number, body?: unknown) {
  return vi.fn<Fetcher>().mockResolvedValue(
    new Response(body === undefined ? null : JSON.stringify(body), { status }),
  )
}

describe('request', () => {
  it('le pide al cliente la URL bajo /api, con JSON, y devuelve el cuerpo', async () => {
    const fetcher = fakeFetch(200, [{ id: 1 }])

    const result = await request('/turnos?status=Pending', { method: 'GET' }, fetcher)

    expect(result).toEqual([{ id: 1 }])
    expect(fetcher).toHaveBeenCalledOnce()
    const [url, init] = fetcher.mock.calls[0]
    expect(url).toBe('/api/turnos?status=Pending')
    expect(init?.method).toBe('GET')
    expect(new Headers(init?.headers).get('Content-Type')).toBe('application/json')
  })

  it('si la API rechaza, lanza el mensaje que manda la API y no uno genérico', async () => {
    // Lo que ve el ciudadano cuando el horario ya está tomado sale de acá.
    const fetcher = fakeFetch(409, { error: 'That time slot already has a confirmed appointment. Choose another.' })

    await expect(request('/turnos', { method: 'POST' }, fetcher))
      .rejects.toThrow('That time slot already has a confirmed appointment. Choose another.')
  })

  it('si la respuesta de error no es JSON, cae al mensaje con el código', async () => {
    const fetcher = vi.fn<Fetcher>().mockResolvedValue(new Response('Bad Gateway', { status: 502 }))

    await expect(request('/turnos', {}, fetcher)).rejects.toThrow('Error 502')
  })

  it('un 204 sin cuerpo devuelve null en vez de romper al leer JSON', async () => {
    const fetcher = fakeFetch(204)

    await expect(request('/turnos/1/cancelar', { method: 'PUT' }, fetcher)).resolves.toBeNull()
  })
})
