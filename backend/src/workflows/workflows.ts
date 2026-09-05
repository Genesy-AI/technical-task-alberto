import { proxyActivities } from '@temporalio/workflow'
import type * as activities from './activities'
import { runPhoneWaterfall } from './phoneWaterfall'

const retryPolicy = {
  maximumAttempts: 3,
  initialInterval: '1 second' as const,
  backoffCoefficient: 2,
  maximumInterval: '10 seconds' as const,
}

const { lookupOrion } = proxyActivities<typeof activities>({
  startToCloseTimeout: '15 seconds',
  retry: retryPolicy,
})

const { lookupAstra } = proxyActivities<typeof activities>({
  startToCloseTimeout: '3 seconds',
  retry: retryPolicy,
})

const { lookupNimbus } = proxyActivities<typeof activities>({
  startToCloseTimeout: '8 seconds',
  retry: retryPolicy,
})

const { loadLeadForEnrichment, setPhoneEnrichmentProgress } = proxyActivities<typeof activities>({
  startToCloseTimeout: '5 seconds',
  retry: retryPolicy,
})

const { verifyEmail } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30 seconds',
  retry: retryPolicy,
})

export async function verifyEmailWorkflow(email: string): Promise<boolean> {
  return await verifyEmail(email)
}

export async function enrichPhoneWorkflow(leadId: number): Promise<void> {
  const lead = await loadLeadForEnrichment(leadId)
  await setPhoneEnrichmentProgress({ leadId, status: 'pending' })

  const outcome = await runPhoneWaterfall(async (provider) => {
    await setPhoneEnrichmentProgress({ leadId, status: provider })
    if (provider === 'orion') {
      return lookupOrion(lead)
    }
    if (provider === 'astra') {
      return lookupAstra(lead)
    }
    return lookupNimbus(lead)
  })

  if (outcome.status === 'found') {
    await setPhoneEnrichmentProgress({
      leadId,
      status: 'found',
      phoneNumber: outcome.phone,
      provider: outcome.provider,
    })
    return
  }

  await setPhoneEnrichmentProgress({
    leadId,
    status: outcome.status,
    provider: null,
  })
}
