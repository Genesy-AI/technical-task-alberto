import { ApplicationFailure } from '@temporalio/client'
import { prisma } from '../../db'
import { phoneProviders } from '../../providers'
import { ProviderHttpError, RetryableProviderError } from '../../providers/http'
import { LeadLookupInput, PhoneEnrichmentStatus, ProviderId } from '../../providers/types'

async function lookupWithProvider(providerId: ProviderId, input: LeadLookupInput): Promise<string | null> {
  try {
    const result = await phoneProviders[providerId].lookup(input)
    return result.phone
  } catch (error) {
    if (error instanceof RetryableProviderError) {
      const retryAfterMs = error.retryAfterMs
      if (retryAfterMs && retryAfterMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, Math.min(retryAfterMs, 10_000)))
      }
      throw ApplicationFailure.create({
        message: error.message,
        type: 'RetryableProviderError',
        nonRetryable: false,
      })
    }

    if (error instanceof ProviderHttpError) {
      throw ApplicationFailure.create({
        message: error.message,
        type: 'ProviderHttpError',
        nonRetryable: true,
      })
    }

    throw ApplicationFailure.create({
      message: error instanceof Error ? error.message : 'Provider lookup failed',
      type: 'ProviderError',
      nonRetryable: false,
    })
  }
}

export async function loadLeadForEnrichment(leadId: number): Promise<LeadLookupInput> {
  const lead = await prisma.lead.findUnique({ where: { id: leadId } })
  if (!lead) {
    throw ApplicationFailure.create({
      message: `Lead ${leadId} not found`,
      type: 'LeadNotFound',
      nonRetryable: true,
    })
  }

  return {
    firstName: lead.firstName,
    lastName: lead.lastName,
    email: lead.email,
    jobTitle: lead.jobTitle,
    companyName: lead.companyName,
  }
}

export async function setPhoneEnrichmentProgress(args: {
  leadId: number
  status: PhoneEnrichmentStatus
  phoneNumber?: string | null
  provider?: ProviderId | null
}): Promise<void> {
  await prisma.lead.update({
    where: { id: args.leadId },
    data: {
      phoneEnrichmentStatus: args.status,
      ...(args.phoneNumber !== undefined ? { phoneNumber: args.phoneNumber } : {}),
      ...(args.provider !== undefined ? { phoneEnrichmentProvider: args.provider } : {}),
      ...(args.status === 'no_data' || args.status === 'failed' ? { phoneEnrichmentProvider: null } : {}),
    },
  })
}

export async function lookupOrion(input: LeadLookupInput): Promise<string | null> {
  return lookupWithProvider('orion', input)
}

export async function lookupAstra(input: LeadLookupInput): Promise<string | null> {
  return lookupWithProvider('astra', input)
}

export async function lookupNimbus(input: LeadLookupInput): Promise<string | null> {
  return lookupWithProvider('nimbus', input)
}
