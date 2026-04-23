import { describe, it, expect, vi, beforeEach } from 'vitest'
import { type Client } from '@libsql/client'
import { createTestDb } from '../helpers/db'
import { createDbMock, seed, getRow } from '../helpers/mockDb'
import { nanoid } from 'nanoid'

let testDb: Client
vi.mock('@/db', () => createDbMock(() => testDb))
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({ get: vi.fn(() => undefined) })),
}))

import {
  GET as listCharacters,
  POST as createCharacter,
} from '@/app/api/books/[id]/characters/route'
import {
  PATCH as updateCharacter,
  DELETE as deleteCharacter,
} from '@/app/api/books/[id]/characters/[characterId]/route'

function makeRequest(method: string, body?: unknown): Request {
  return new Request('http://localhost', {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  })
}

async function seedBook(client: Client): Promise<string> {
  const id = nanoid()
  const now = Date.now()
  await seed(
    client,
    'INSERT INTO books (id, title, genre, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
    [id, 'Test', 'Fantasy', now, now]
  )
  return id
}

async function seedChar(
  client: Client,
  bookId: string,
  name = 'Alice',
  role = 'protagonist'
): Promise<string> {
  const id = nanoid()
  const now = Date.now()
  await seed(
    client,
    `INSERT INTO characters (id, book_id, name, role, status, data, created_at, updated_at)
     VALUES (?, ?, ?, ?, 'unknown', '{}', ?, ?)`,
    [id, bookId, name, role, now, now]
  )
  return id
}

beforeEach(async () => { testDb = await createTestDb() })

describe('GET /api/books/[id]/characters', () => {
  it('returns 404 for unknown book', async () => {
    expect((await listCharacters(makeRequest('GET'), { params: { id: 'missing' } })).status).toBe(404)
  })

  it('returns empty array for book with no characters', async () => {
    const bookId = await seedBook(testDb)
    const chars = await (await listCharacters(makeRequest('GET'), { params: { id: bookId } })).json()
    expect(chars).toHaveLength(0)
  })

  it('returns characters sorted by role then name', async () => {
    const bookId = await seedBook(testDb)
    await seedChar(testDb, bookId, 'Zara', 'supporting')
    await seedChar(testDb, bookId, 'Alice', 'protagonist')
    await seedChar(testDb, bookId, 'Bob', 'antagonist')
    const chars = await (
      await listCharacters(makeRequest('GET'), { params: { id: bookId } })
    ).json() as Array<{ name: string }>
    expect(chars[0].name).toBe('Alice')
    expect(chars[1].name).toBe('Bob')
    expect(chars[2].name).toBe('Zara')
  })
})

describe('POST /api/books/[id]/characters', () => {
  it('returns 404 for unknown book', async () => {
    expect(
      (await createCharacter(makeRequest('POST', { name: 'Hero' }), { params: { id: 'missing' } })).status
    ).toBe(404)
  })

  it('returns 400 when name is missing', async () => {
    const bookId = await seedBook(testDb)
    expect(
      (await createCharacter(makeRequest('POST', { role: 'protagonist' }), { params: { id: bookId } })).status
    ).toBe(400)
  })

  it('creates a character and returns 201', async () => {
    const bookId = await seedBook(testDb)
    const res = await createCharacter(
      makeRequest('POST', { name: 'Merlin', role: 'supporting', status: 'alive' }),
      { params: { id: bookId } }
    )
    expect(res.status).toBe(201)
    const char = await res.json()
    expect(char.name).toBe('Merlin')
    expect(char.status).toBe('alive')
  })

  it('defaults role to minor and status to unknown', async () => {
    const bookId = await seedBook(testDb)
    const char = await (
      await createCharacter(makeRequest('POST', { name: 'Nobody' }), { params: { id: bookId } })
    ).json()
    expect(char.role).toBe('minor')
    expect(char.status).toBe('unknown')
  })
})

describe('PATCH /api/books/[id]/characters/[characterId]', () => {
  it('returns 404 for unknown character', async () => {
    const bookId = await seedBook(testDb)
    expect(
      (await updateCharacter(makeRequest('PATCH', { name: 'X' }), { params: { id: bookId, characterId: 'ghost' } })).status
    ).toBe(404)
  })

  it('updates character name', async () => {
    const bookId = await seedBook(testDb)
    const charId = await seedChar(testDb, bookId, 'OldName')
    const updated = await (
      await updateCharacter(makeRequest('PATCH', { name: 'NewName' }), { params: { id: bookId, characterId: charId } })
    ).json()
    expect(updated.name).toBe('NewName')
  })
})

describe('DELETE /api/books/[id]/characters/[characterId]', () => {
  it('returns 404 for unknown character', async () => {
    const bookId = await seedBook(testDb)
    expect(
      (await deleteCharacter(makeRequest('DELETE'), { params: { id: bookId, characterId: 'ghost' } })).status
    ).toBe(404)
  })

  it('deletes the character', async () => {
    const bookId = await seedBook(testDb)
    const charId = await seedChar(testDb, bookId, 'Doomed')
    await deleteCharacter(makeRequest('DELETE'), { params: { id: bookId, characterId: charId } })
    expect(
      await getRow(testDb, 'SELECT id FROM characters WHERE id = ?', [charId])
    ).toBeUndefined()
  })
})
