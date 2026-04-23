import { describe, it, expect, vi, beforeEach } from 'vitest'
import { type Client } from '@libsql/client'
import { createTestDb } from '../helpers/db'
import { createDbMock, seed } from '../helpers/mockDb'
import { nanoid } from 'nanoid'

let testDb: Client
vi.mock('@/db', () => createDbMock(() => testDb))
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({ get: vi.fn(() => undefined) })),
}))

import { GET as listChapters } from '@/app/api/books/[id]/chapters/route'

function makeRequest(method = 'GET'): Request {
  return new Request('http://localhost', { method })
}

async function seedBook(client: Client): Promise<string> {
  const id = nanoid()
  const now = Date.now()
  await seed(
    client,
    'INSERT INTO books (id, title, genre, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
    [id, 'Book', 'Fantasy', now, now]
  )
  return id
}

async function seedChapter(
  client: Client,
  bookId: string,
  overrides: Partial<{ number: number; title: string; processing_status: string }> = {}
): Promise<string> {
  const id = nanoid()
  const now = Date.now()
  await seed(
    client,
    `INSERT INTO chapters (id, book_id, number, title, content, word_count, processing_status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 3, ?, ?, ?)`,
    [
      id, bookId,
      overrides.number ?? 1,
      overrides.title ?? 'Ch One',
      'Some content.',
      overrides.processing_status ?? 'done',
      now, now,
    ]
  )
  return id
}

beforeEach(async () => { testDb = await createTestDb() })

describe('GET /api/books/[id]/chapters', () => {
  it('returns empty array when no chapters', async () => {
    const bookId = await seedBook(testDb)
    const chapters = await (await listChapters(makeRequest(), { params: { id: bookId } })).json()
    expect(chapters).toHaveLength(0)
  })

  it('returns chapters ordered by number ASC', async () => {
    const bookId = await seedBook(testDb)
    await seedChapter(testDb, bookId, { number: 3, title: 'Three' })
    await seedChapter(testDb, bookId, { number: 1, title: 'One' })
    await seedChapter(testDb, bookId, { number: 2, title: 'Two' })
    const chapters = await (
      await listChapters(makeRequest(), { params: { id: bookId } })
    ).json() as Array<{ number: number }>
    expect(chapters.map((c) => c.number)).toEqual([1, 2, 3])
  })

  it('shapes chapters with expected fields', async () => {
    const bookId = await seedBook(testDb)
    await seedChapter(testDb, bookId)
    const [ch] = await (
      await listChapters(makeRequest(), { params: { id: bookId } })
    ).json() as Array<Record<string, unknown>>
    expect(ch).toHaveProperty('id')
    expect(ch).toHaveProperty('wordCount')
    expect(ch).toHaveProperty('processed')
    expect(ch).toHaveProperty('flags')
    expect(ch).toHaveProperty('charactersAppearing')
  })

  it('marks done chapter as processed=true', async () => {
    const bookId = await seedBook(testDb)
    await seedChapter(testDb, bookId, { processing_status: 'done' })
    const [ch] = await (
      await listChapters(makeRequest(), { params: { id: bookId } })
    ).json() as Array<{ processed: boolean }>
    expect(ch.processed).toBe(true)
  })

  it('marks error chapter as processed=false with processingError', async () => {
    const bookId = await seedBook(testDb)
    const chapterId = await seedChapter(testDb, bookId, { processing_status: 'error' })
    await seed(testDb, 'UPDATE chapters SET processing_step = ? WHERE id = ?', ['AI timed out', chapterId])
    const [ch] = await (
      await listChapters(makeRequest(), { params: { id: bookId } })
    ).json() as Array<{ processed: boolean; processingError: string | null }>
    expect(ch.processed).toBe(false)
    expect(ch.processingError).toBe('AI timed out')
  })

  it('includes continuity flags for each chapter', async () => {
    const bookId = await seedBook(testDb)
    const chapterId = await seedChapter(testDb, bookId)
    await seed(
      testDb,
      `INSERT INTO continuity_flags (id, chapter_id, book_id, description, severity, category, resolved, created_at)
       VALUES (?, ?, ?, ?, 'warning', 'continuity', 0, ?)`,
      [nanoid(), chapterId, bookId, 'Possible inconsistency', Date.now()]
    )
    const [ch] = await (
      await listChapters(makeRequest(), { params: { id: bookId } })
    ).json() as Array<{ flags: Array<{ description: string }> }>
    expect(ch.flags).toHaveLength(1)
    expect(ch.flags[0].description).toBe('Possible inconsistency')
  })

  it('returns flags with resolved as boolean', async () => {
    const bookId = await seedBook(testDb)
    const chapterId = await seedChapter(testDb, bookId)
    await seed(
      testDb,
      `INSERT INTO continuity_flags (id, chapter_id, book_id, description, severity, category, resolved, created_at)
       VALUES (?, ?, ?, 'desc', 'info', 'narrative', 1, ?)`,
      [nanoid(), chapterId, bookId, Date.now()]
    )
    const [ch] = await (
      await listChapters(makeRequest(), { params: { id: bookId } })
    ).json() as Array<{ flags: Array<{ resolved: boolean }> }>
    expect(ch.flags[0].resolved).toBe(true)
  })
})
