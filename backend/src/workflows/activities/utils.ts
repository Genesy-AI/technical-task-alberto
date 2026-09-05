import { Context } from '@temporalio/activity'

const JANE_SMITH_DELAY_MS = 20_000

async function sleep(ms: number): Promise<void> {
  let signal: AbortSignal | undefined
  try {
    signal = Context.current().cancellationSignal
  } catch {
    // Running outside a Temporal activity (unit tests).
  }

  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(resolve, ms)
    if (!signal) {
      return
    }

    const onAbort = () => {
      clearTimeout(timeout)
      reject(signal.reason ?? new Error('Activity cancelled'))
    }

    if (signal.aborted) {
      onAbort()
      return
    }

    signal.addEventListener('abort', onAbort, { once: true })
  })
}

export async function verifyEmail(email: string): Promise<boolean> {
  const normalized = typeof email === 'string' ? email : String(email ?? '')
  if (!normalized) {
    return false
  }

  if (normalized.includes('john.doe')) {
    return false
  }

  if (normalized.includes('jane.smith')) {
    await sleep(JANE_SMITH_DELAY_MS)
  }

  if (/\+/.test(normalized)) {
    return false
  }

  return true
}
