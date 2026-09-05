import { describe, expect, it } from 'vitest'
import { runPhoneWaterfall } from '../workflows/phoneWaterfall'

describe('runPhoneWaterfall', () => {
  it('stops at the first provider that returns a phone', async () => {
    const called: string[] = []
    const outcome = await runPhoneWaterfall(async (provider) => {
      called.push(provider)
      if (provider === 'orion') {
        return '+15550001111'
      }
      throw new Error('should not be called')
    })

    expect(outcome).toEqual({ status: 'found', provider: 'orion', phone: '+15550001111' })
    expect(called).toEqual(['orion'])
  })

  it('continues when a provider returns null', async () => {
    const called: string[] = []
    const outcome = await runPhoneWaterfall(async (provider) => {
      called.push(provider)
      if (provider === 'astra') {
        return '+15550002222'
      }
      return null
    })

    expect(outcome).toEqual({ status: 'found', provider: 'astra', phone: '+15550002222' })
    expect(called).toEqual(['orion', 'astra'])
  })

  it('continues when a provider throws after retries', async () => {
    const outcome = await runPhoneWaterfall(async (provider) => {
      if (provider === 'orion') {
        throw new Error('timeout')
      }
      if (provider === 'nimbus') {
        return '+34600111222'
      }
      return null
    })

    expect(outcome).toEqual({ status: 'found', provider: 'nimbus', phone: '+34600111222' })
  })

  it('returns no_data when every provider returns null', async () => {
    const outcome = await runPhoneWaterfall(async () => null)
    expect(outcome).toEqual({ status: 'no_data' })
  })

  it('returns failed when every provider throws', async () => {
    const outcome = await runPhoneWaterfall(async () => {
      throw new Error('down')
    })
    expect(outcome).toEqual({ status: 'failed' })
  })

  it('returns no_data when some providers miss and others throw', async () => {
    const outcome = await runPhoneWaterfall(async (provider) => {
      if (provider === 'orion') {
        return null
      }
      throw new Error('down')
    })
    expect(outcome).toEqual({ status: 'no_data' })
  })
})
