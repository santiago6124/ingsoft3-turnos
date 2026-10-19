// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { whenIs } from './agenda'

// `now` is fixed and goes in by parameter: the result can't depend on the day the
// suite runs. Local time on purpose (no "Z"), same as the API's naive date-times.
const now = new Date(2026, 9, 19, 20, 0) // Monday 19/10/2026, 20:00

describe('whenIs', () => {
  // One row per path the function declares, plus the edges between them.
  it.each([
    ['más tarde el mismo día', '2026-10-19T20:30:00', 'Hoy'],
    ['a la mañana siguiente, aunque falten menos de 24 h', '2026-10-20T09:00:00', 'Mañana'],
    ['en dos días', '2026-10-21T10:00:00', 'En 2 días'],
    ['a seis días: el último que se cuenta en días', '2026-10-25T10:00:00', 'En 6 días'],
    ['a siete días: ya es una semana', '2026-10-26T10:00:00', 'En una semana'],
    ['a trece días: sigue siendo una semana', '2026-11-01T10:00:00', 'En una semana'],
    ['a tres semanas', '2026-11-09T10:00:00', 'En 3 semanas'],
  ])('%s → %s', (_caso, scheduledAt, expected) => {
    expect(whenIs(scheduledAt, now)).toBe(expected)
  })

  it('un turno que ya empezó dice que pasó, aunque sea el mismo día', () => {
    expect(whenIs('2026-10-19T19:59:00', now)).toBe('Ya pasó')
  })

  it('una fecha que no se puede leer no inventa un texto', () => {
    expect(whenIs('no-es-una-fecha', now)).toBe('')
  })
})
