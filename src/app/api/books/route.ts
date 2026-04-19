import { db } from '@/db'
import { generateBookOpening } from '@/lib/claude'
import { generateId } from '@/lib/utils'
import { NextResponse } from 'next/server'

export async function GET() {
  const books = db
    .prepare('SELECT * FROM books ORDER BY updated_at DESC')
    .all()
  return NextResponse.json(books)
}

export async function POST(req: Request) {
  const { title, genre, premise, protagonist_name, protagonist_description } = await req.json()

  if (!title?.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }

  const id = generateId()
  const now = Date.now()

  // Save the book first so we can redirect quickly
  db.prepare(
    `INSERT INTO books (id, title, genre, premise, protagonist_name, protagonist_description, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    title.trim(),
    genre ?? 'Fantasy',
    premise?.trim() || null,
    protagonist_name?.trim() || null,
    protagonist_description?.trim() || null,
    now,
    now
  )

  // Generate logline + welcome message via Claude (non-blocking on failure)
  try {
    const { logline, welcome } = await generateBookOpening({
      title: title.trim(),
      genre,
      premise,
      protagonist_name,
      protagonist_description,
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
