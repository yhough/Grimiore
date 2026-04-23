import { type Client } from '@libsql/client'
import { vi } from 'vitest'

type InArgs = unknown[]

/**
 * Returns a vi.mock factory for `@/db` that delegates all async helpers to
 * a `@libsql/client` in-memory client via a getter closure.
 *
 * Usage in a test file:
 *
 *   let testDb: Client
 *   vi.mock('@/db', () => createDbMock(() => testDb))
 *   beforeEach(async () => { testDb = await createTestDb() })
 */
export function createDbMock(getClient: () => Client) {
  return {
    initDb: vi.fn().mockResolvedValue(undefined),

    queryAll: vi.fn(async <T>(sql: string, args: InArgs = []): Promise<T[]> => {
      const { rows } = await getClient().execute({ sql, args: args as never })
      return rows as unknown as T[]
    }),

    queryFirst: vi.fn(async <T>(sql: string, args: InArgs = []): Promise<T | null> => {
      const { rows } = await getClient().execute({ sql, args: args as never })
      return rows.length > 0 ? (rows[0] as unknown as T) : null
    }),

    execute: vi.fn(async (sql: string, args: InArgs = []): Promise<void> => {
      await getClient().execute({ sql, args: args as never })
    }),

    batchWrite: vi.fn(async (stmts: Array<{ sql: string; args?: unknown[] }>): Promise<void> => {
      await getClient().batch(
        stmts.map((s) => ({ sql: s.sql, args: (s.args ?? []) as never })),
        'write'
      )
    }),

    // Expose the raw client for direct test assertions
    get db() { return getClient() },
  }
}

/**
 * Execute a single INSERT/UPDATE for seeding test data.
 * Thin wrapper so test seed helpers don't need to import @libsql/client directly.
 */
export async function seed(client: Client, sql: string, args: unknown[] = []): Promise<void> {
  await client.execute({ sql, args: args as never })
}

/**
 * Query a single row for test assertions.
 */
export async function getRow<T>(client: Client, sql: string, args: unknown[] = []): Promise<T | undefined> {
  const { rows } = await client.execute({ sql, args: args as never })
  return rows[0] as unknown as T | undefined
}

/**
 * Query all rows for test assertions.
 */
export async function getRows<T>(client: Client, sql: string, args: unknown[] = []): Promise<T[]> {
  const { rows } = await client.execute({ sql, args: args as never })
  return rows as unknown as T[]
}
