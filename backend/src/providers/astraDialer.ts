import { providerConfig } from './config'
import { providerPost } from './http'
import { normalizePhone } from './mapping'
import { LeadLookupInput, PhoneLookupResult, PhoneProvider } from './types'

export const astraDialer: PhoneProvider = {
  id: 'astra',
  async lookup(input: LeadLookupInput): Promise<PhoneLookupResult> {
    const data = (await providerPost({
      providerId: 'astra',
      url: providerConfig.astra.baseUrl,
      headers: { apiKey: providerConfig.astra.apiKey },
      body: { email: input.email },
    })) as { phoneNmbr?: string | null }

    return { phone: normalizePhone(data?.phoneNmbr) }
  },
}
