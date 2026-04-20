import { db } from '@/db'
import { generateBookOpening } from '@/lib/claude'
import { generateId } from '@/lib/utils'
import { NextResponse } from 'next/server'

interface CharacterInput {
  name: string
  role: string
  description?: string | null
}

interface WorldEntryInput {
  name: string
  type: string
  summary?: string | null
}

export async function GET() {
  const books = db
    .prepare('SELECT * FROM books ORDER BY updated_at DESC')
    .all()
  return NextResponse.json(books)
}

export async function POST(req: Request) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const {
    title,
    genre,
    premise,
    characters,
    worldEntries,
  } = body as {
    title?: string
    genre?: string
    premise?: string | null
    characters?: CharacterInput[]
    worldEntries?: WorldEntryInput[]
  }

  if (!title?.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }

  const id = generateId()
  const now = Date.now()

  // Derive protagonist from characters list (first protagonist role, or first character)
  const protagonistChar = characters?.find((c) => c.role === 'protagonist') ?? characters?.[0]

  // Insert book + seed data in a single transaction
  db.transaction(() => {
    db.prepare(
      `INSERT INTO books (id, title, genre, premise, protagonist_name, protagonist_description, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      title.trim(),
      genre ?? 'Fantasy',
      premise?.trim() || null,
      protagonistChar?.name?.trim() || null,
      protagonistChar?.description?.trim() || null,
      now,
      now
    )

    // Seed characters
    if (Array.isArray(characters)) {
      const insertChar = db.prepare(
        `INSERT INTO characters (id, book_id, name, role, description, status, arc_status, data, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'unknown', NULL, '{}', ?, ?)`
      )
      for (const char of characters) {
        if (!char.name?.trim()) continue
        const validRoles = ['protagonist', 'antagonist', 'supporting', 'minor']
        insertChar.run(
          generateId(),
          id,
          char.name.trim(),
          validRoles.includes(char.role) ? char.role : 'minor',
          char.description?.trim() || null,
          now,
          now
        )
      }
    }

    // Seed world entries
    if (Array.isArray(worldEntries)) {
      const insertEntry = db.prepare(
        `INSERT INTO book_state_entries (id, book_id, type, name, summary, data, source, source_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, '{}', 'chat', NULL, ?, ?)`
      )
      const validTypes = ['world_fact', 'location', 'faction', 'event', 'misc']
      for (const entry of worldEntries) {
        if (!entry.name?.trim()) continue
        insertEntry.run(
          generateId(),
          id,
          validTypes.includes(entry.type) ? entry.type : 'misc',
          entry.name.trim(),
          entry.summary?.trim() || null,
          now,
          now
        )
      }
    }
  })()

  // Generate logline + welcome message via Claude (non-blocking on failure)
  try {
    const { logline, welcome } = await generateBookOpening({
      title: title.trim(),
      genre: genre ?? 'Fantasy',
      premise: premise ?? null,
      protagonist_name: protagonistChar?.name ?? null,
      protagonist_description: protagonistChar?.description ?? null,
    })

    if (logline) {
      db.prepare('UPDATE books SET logline = ?, updated_at = ? WHERE id = ?').run(logline, Date.now(), id)
    }

    if (welcome) {
      db.prepare(
        `INSERT INTO chat_messages (id, book_id, character_id, role, content, metadata, created_at)
         VALUES (?, ?, NULL, 'assistant', ?, '{}', ?)`
      ).run(generateId(), id, welcome, Date.now())
    }
  } catch (err) {
    // Claude unavailable — book is still created, just without AI opener
    console.error('Claude error during book creation:', err)
  }

  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(id)
  return NextResponse.json(book, { status: 201 })
}
