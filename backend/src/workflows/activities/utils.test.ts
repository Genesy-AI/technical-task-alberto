import { afterEach, describe, expect, it, vi } from 'vitest'
import { verifyEmail } from './utils'

describe('verifyEmail', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns false for john.doe addresses', async () => {
    await expect(verifyEmail('john.doe@example.com')).resolves.toBe(false)
  })

  it('returns false for plus-addressed emails', async () => {
    await expect(verifyEmail('ada+tag@example.com')).resolves.toBe(false)
  })

  it('returns true for a normal email', async () => {
    await expect(verifyEmail('ada@example.com')).resolves.toBe(true)
  })

  it('returns true for jane.smith after the slow delay', async () => {
    vi.useFakeTimers()
    const result = verifyEmail('jane.smith@example.com')
    await vi.advanceTimersByTimeAsync(20_000)
    await expect(result).resolves.toBe(true)
  })

  it('does not throw for null or empty email', async () => {
    await expect(verifyEmail(null as unknown as string)).resolves.toBe(false)
    await expect(verifyEmail('')).resolves.toBe(false)
    await expect(verifyEmail(undefined as unknown as string)).resolves.toBe(false)
  })
})
