import { describe, it, expect } from 'vitest'
import { decodeCsvBytes } from './decodeCsvBytes'

describe('decodeCsvBytes', () => {
  it('decodes UTF-8 without a BOM', () => {
    const text = 'Iñaki,Álvarez'
    const bytes = new TextEncoder().encode(text)

    expect(decodeCsvBytes(bytes)).toBe(text)
  })

  it('strips a UTF-8 BOM and keeps the text intact', () => {
    const text = 'Iñaki,Álvarez'
    const encoded = new TextEncoder().encode(text)
    const bytes = new Uint8Array(3 + encoded.length)
    bytes.set([0xef, 0xbb, 0xbf])
    bytes.set(encoded, 3)

    expect(decodeCsvBytes(bytes)).toBe(text)
  })

  it('decodes windows-1252 bytes for Iñaki instead of producing mojibake', () => {
    // "Iñaki" in windows-1252: ñ is 0xF1 (invalid as a standalone UTF-8 byte)
    const bytes = new Uint8Array([0x49, 0xf1, 0x61, 0x6b, 0x69])

    expect(decodeCsvBytes(bytes)).toBe('Iñaki')
    expect(decodeCsvBytes(bytes)).not.toContain('Ã')
  })

  it('falls back to windows-1252 for invalid UTF-8 instead of throwing', () => {
    const bytes = new Uint8Array([0xff])

    expect(() => decodeCsvBytes(bytes)).not.toThrow()
    expect(decodeCsvBytes(bytes)).toBe('ÿ')
  })

  it('decodes UTF-16 LE with a BOM', () => {
    const bytes = new Uint8Array([0xff, 0xfe, 0x55, 0x00, 0x53, 0x00])

    expect(decodeCsvBytes(bytes)).toBe('US')
  })
})
