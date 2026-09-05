import { describe, expect, it } from 'vitest'
import { companyWebsiteFromEmail, formatNimbusPhone, fullNameFromLead, normalizePhone } from './mapping'

describe('companyWebsiteFromEmail', () => {
  it('extracts the domain from a standard email', () => {
    expect(companyWebsiteFromEmail('ada@example.com')).toBe('example.com')
  })

  it('lowercases the domain', () => {
    expect(companyWebsiteFromEmail('Ada@Example.COM')).toBe('example.com')
  })

  it('returns empty string when the email has no domain', () => {
    expect(companyWebsiteFromEmail('not-an-email')).toBe('')
    expect(companyWebsiteFromEmail('trailing@')).toBe('')
  })
})

describe('normalizePhone', () => {
  it('returns trimmed strings', () => {
    expect(normalizePhone('  +15551212  ')).toBe('+15551212')
  })

  it('treats null, undefined, and empty values as no phone', () => {
    expect(normalizePhone(null)).toBeNull()
    expect(normalizePhone(undefined)).toBeNull()
    expect(normalizePhone('')).toBeNull()
    expect(normalizePhone('   ')).toBeNull()
  })

  it('stringifies numeric values', () => {
    expect(normalizePhone(4155551212)).toBe('4155551212')
  })
})

describe('formatNimbusPhone', () => {
  it('combines numeric country calling codes', () => {
    expect(formatNimbusPhone(4155551212, '1')).toBe('+14155551212')
  })

  it('keeps an explicit plus prefix', () => {
    expect(formatNimbusPhone(612345678, '+34')).toBe('+34612345678')
  })

  it('maps ISO country codes to calling codes', () => {
    expect(formatNimbusPhone(612345678, 'ES')).toBe('+34612345678')
    expect(formatNimbusPhone('4155551212', 'US')).toBe('+14155551212')
  })

  it('returns null when the number is missing', () => {
    expect(formatNimbusPhone(null, 'US')).toBeNull()
    expect(formatNimbusPhone('', 'US')).toBeNull()
  })

  it('falls back to +digits when country code is unknown', () => {
    expect(formatNimbusPhone(12345, 'ZZ')).toBe('+12345')
    expect(formatNimbusPhone(12345, null)).toBe('+12345')
  })
})

describe('fullNameFromLead', () => {
  it('joins first and last name', () => {
    expect(fullNameFromLead('Ada', 'Lovelace')).toBe('Ada Lovelace')
  })
})
