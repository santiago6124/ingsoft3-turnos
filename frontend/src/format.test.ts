import { describe, it, expect } from 'vitest'
import { formatDate, formatTime, formatStatus, formatNationalId } from './format'

// Estos tests cubren LÓGICA, no que la función exista: el agrupamiento de miles
// del DNI, el dígito verificador, y el fallback de un estado desconocido.

describe('formatNationalId', () => {
  it('agrupa de a tres desde la derecha y separa el dígito verificador', () => {
    // 12345678 -> base 1234567 + verificador 8
    expect(formatNationalId('12345678')).toBe('1.234.567-8')
  })

  it('no inventa un grupo vacío cuando la cantidad de dígitos es múltiplo de tres', () => {
    // 1234 -> base 123 + verificador 4. El bucle corta en 3, así que NO debe quedar ".123-4"
    expect(formatNationalId('1234')).toBe('123-4')
  })

  it('ignora los separadores que ya venían en el texto', () => {
    // El mismo número escrito de tres formas distintas tiene que dar el mismo resultado.
    const esperado = '1.234.567-8'
    expect(formatNationalId('12.345.678')).toBe(esperado)
    expect(formatNationalId('12 345 678')).toBe(esperado)
    expect(formatNationalId('1.234.567-8')).toBe(esperado)
  })

  it('devuelve la entrada tal cual si es demasiado corta para tener verificador', () => {
    // Con menos de dos dígitos no hay nada que separar: no debe romper ni devolver "-1".
    expect(formatNationalId('1')).toBe('1')
    expect(formatNationalId('')).toBe('')
  })
})

describe('formatStatus', () => {
  it('traduce los tres estados que devuelve la API', () => {
    expect(formatStatus('Pending')).toBe('Pendiente')
    expect(formatStatus('Confirmed')).toBe('Confirmado')
    expect(formatStatus('Cancelled')).toBe('Cancelado')
  })

  it('si la API agrega un estado nuevo, lo muestra crudo en vez de vacío', () => {
    // Regla defensiva: preferimos mostrar "Expired" a dejar la celda en blanco.
    expect(formatStatus('Expired')).toBe('Expired')
  })
})

describe('formatDate / formatTime', () => {
  // Sin "Z" al final, JS lo interpreta como hora LOCAL: el test no depende del huso.
  const iso = '2026-09-02T09:05:00'

  it('rellena con cero a la izquierda el día, el mes y la hora', () => {
    expect(formatDate('2026-01-05T00:00:00')).toBe('05/01/2026')
    expect(formatTime(iso)).toBe('09:05')
  })

  it('formatea la fecha como dd/mm/aaaa', () => {
    expect(formatDate(iso)).toBe('02/09/2026')
  })
})
