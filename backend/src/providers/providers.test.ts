import { afterEach, describe, expect, it, vi } from 'vitest'
import { astraDialer } from './astraDialer'
import { nimbusLookup } from './nimbusLookup'
import { orionConnect } from './orionConnect'
import { LeadLookupInput } from './types'

const lead: LeadLookupInput = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  jobTitle: 'CTO',
  companyName: 'Analytical Engines',
}

function jsonResponse(body: unknown, init?: { status?: number; headers?: Record<string, string> }) {
  const status = init?.status ?? 200
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers(init?.headers),
    json: async () => body,
  }
}

describe('phone providers', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('maps Orion fullName and companyWebsite from the lead', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ phone: '+15551212' }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await orionConnect.lookup(lead)

    expect(result.phone).toBe('+15551212')
    expect(fetchMock).toHaveBeenCalledOnce()
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('orionConnect')
    expect((init.headers as Record<string, string>)['x-auth-me']).toBe('mySecretKey123')
    expect(JSON.parse(String(init.body))).toEqual({
      fullName: 'Ada Lovelace',
      companyWebsite: 'example.com',
    })
  })

  it('treats an empty Orion phone as a miss', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ phone: null })))
    await expect(orionConnect.lookup(lead)).resolves.toEqual({ phone: null })
  })

  it('maps Astra email and phoneNmbr, including undefined', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ phoneNmbr: undefined }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await astraDialer.lookup(lead)
    expect(result.phone).toBeNull()

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('astraDialer')
    expect((init.headers as Record<string, string>).apiKey).toBe('1234jhgf')
    expect(JSON.parse(String(init.body))).toEqual({ email: 'ada@example.com' })
  })

  it('formats Nimbus number and countryCode and sends the api query param', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ number: 612345678, countryCode: 'ES' })
    )
    vi.stubGlobal('fetch', fetchMock)

    const result = await nimbusLookup.lookup(lead)
    expect(result.phone).toBe('+34612345678')

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('numbusLookup')
    expect(url).toContain('api=000099998888')
    expect(JSON.parse(String(init.body))).toEqual({
      email: 'ada@example.com',
      jobTitle: 'CTO',
    })
  })
})
