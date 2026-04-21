import { db } from '@/db'
import { NextResponse } from 'next/server'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(params.id)
  if (!book) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(book)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const book = db.prepare('SELECT id FROM books WHERE id = ?').get(params.id)
  if (!book) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { title, genre, premise, logline } = await req.json()
  if (title !== undefined && !title?.trim()) {
    return NextResponse.json({ error: 'Title cannot be empty.' }, { status: 400 })
  }

  db.prepare(`
    UPDATE books
    SET title   = COALESCE(?, title),
        genre   = COALESCE(?, genre),
        premise = ?,
        logline = ?,
        updated_at = ?
    WHERE id = ?
  `).run(
    title?.trim() ?? null,
    genre ?? null,
    premise !== undefined ? (premise?.trim() || null) : undefined,
    logline !== undefined ? (logline?.trim() || null) : undefined,
    Date.now(),
    params.id,
  )

  return NextResponse.json(db.prepare('SELECT * FROM books WHERE id = ?').get(params.id))
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  db.prepare('DELETE FROM books WHERE id = ?').run(params.id)
  return new NextResponse(null, { status: 204 })
}
