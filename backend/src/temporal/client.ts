import { Connection, Client } from '@temporalio/client'

const TEMPORAL_ADDRESS = 'localhost:7233'
const TEMPORAL_NAMESPACE = 'default'

let clientPromise: Promise<Client> | null = null

export async function getTemporalClient(): Promise<Client> {
  if (!clientPromise) {
    clientPromise = Connection.connect({ address: TEMPORAL_ADDRESS }).then(
      (connection) => new Client({ connection, namespace: TEMPORAL_NAMESPACE })
    )
  }

  return clientPromise
}

export const TEMPORAL_TASK_QUEUE = 'myQueue'
