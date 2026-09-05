import { describe, it, expect } from 'vitest'
import { sanitizeCountryCode } from './countryCode'

describe('sanitizeCountryCode', () => {
  it('returns null for empty values', () => {
    expect(sanitizeCountryCode(null)).toBeNull()
    expect(sanitizeCountryCode(undefined)).toBeNull()
    expect(sanitizeCountryCode('')).toBeNull()
    expect(sanitizeCountryCode('   ')).toBeNull()
  })

  it('normalizes valid ISO 3166-1 alpha-2 codes to uppercase', () => {
    expect(sanitizeCountryCode('US')).toBe('US')
    expect(sanitizeCountryCode('es')).toBe('ES')
    expect(sanitizeCountryCode(' Us ')).toBe('US')
    expect(sanitizeCountryCode('fr')).toBe('FR')
  })

  it('rejects non-ISO values from the example CSV', () => {
    expect(sanitizeCountryCode('XXX')).toBeNull()
    expect(sanitizeCountryCode('12')).toBeNull()
  })

  it('rejects codes that are not two letters', () => {
    expect(sanitizeCountryCode('USA')).toBeNull()
    expect(sanitizeCountryCode('U')).toBeNull()
    expect(sanitizeCountryCode('U1')).toBeNull()
  })
})
