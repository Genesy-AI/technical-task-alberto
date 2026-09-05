import { providerConfig } from './config'
import { providerPost } from './http'
import { formatNimbusPhone } from './mapping'
import { LeadLookupInput, PhoneLookupResult, PhoneProvider } from './types'

export const nimbusLookup: PhoneProvider = {
  id: 'nimbus',
  async lookup(input: LeadLookupInput): Promise<PhoneLookupResult> {
    const url = new URL(providerConfig.nimbus.baseUrl)
    url.searchParams.set('api', providerConfig.nimbus.apiKey)

    const data = (await providerPost({
      providerId: 'nimbus',
      url: url.toString(),
      body: {
        email: input.email,
        jobTitle: input.jobTitle ?? '',
      },
    })) as { number?: number | string | null; countryCode?: string | null }

    return { phone: formatNimbusPhone(data?.number, data?.countryCode) }
  },
}
