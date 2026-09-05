import { astraDialer } from './astraDialer'
import { nimbusLookup } from './nimbusLookup'
import { orionConnect } from './orionConnect'
import { PhoneProvider, ProviderId } from './types'

export * from './types'
export * from './mapping'
export { providerConfig } from './config'

export const phoneProviders: Record<ProviderId, PhoneProvider> = {
  orion: orionConnect,
  astra: astraDialer,
  nimbus: nimbusLookup,
}
