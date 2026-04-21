import { db } from '@/db'
import { NextResponse } from 'next/server'

// ── PATCH /api/books/[id]/chapters/[chapterId] ────────────────────────────────
// Updates the chapter number. If another chapter holds that number, they swap.

export async function PATCH(
  req: Request,
  { params }: { params: { id: string; chapterId: string } }
) {
  const { number: newNumber } = await req.json() as { number: number }

  if (!Number.isInteger(newNumber) || newNumber < 1) {
    return NextResponse.json({ error: 'Invalid chapter number' }, { status: 400 })
  }

  const chapter = db
    .prepare('SELECT id, number FROM chapters WHERE id = ? AND book_id = ?')
    .get(params.chapterId, params.id) as { id: string; number: number } | undefined

  if (!chapter) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (chapter.number === newNumber) return NextResponse.json({ ok: true })

  const conflict = db
    .prepare('SELECT id FROM chapters WHERE book_id = ? AND number = ?')
    .get(params.id, newNumber) as { id: string } | undefined

  db.transaction(() => {
    if (conflict) {
      // Swap: give the conflicting chapter the old number
      db.prepare('UPDATE chapters SET number = ? WHERE id = ?').run(chapter.number, conflict.id)
    }
    db.prepare('UPDATE chapters SET number = ? WHERE id = ?').run(newNumber, params.chapterId)
    db.prepare('UPDATE books SET updated_at = ? WHERE id = ?').run(Date.now(), params.id)
  })()

  return NextResponse.json({ ok: true })
}

// ── DELETE /api/books/[id]/chapters/[chapterId] ───────────────────────────────
// Deletes the chapter and shifts all subsequent chapter numbers down by 1.

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string; chapterId: string } }
) {
  const chapter = db
    .prepare('SELECT id, number FROM chapters WHERE id = ? AND book_id = ?')
    .get(params.chapterId, params.id) as { id: string; number: number } | undefined

  if (!chapter) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  db.transaction(() => {
    // Delete the chapter (cascades to continuity_flags, annotations via FK)
    db.prepare('DELETE FROM chapters WHERE id = ?').run(params.chapterId)

    // Shift all higher-numbered chapters in this book down by 1
    db.prepare(
      'UPDATE chapters SET number = number - 1 WHERE book_id = ? AND number > ?'
    ).run(params.id, chapter.number)

    // Bump book updated_at
    db.prepare('UPDATE books SET updated_at = ? WHERE id = ?').run(Date.now(), params.id)
  })()

  return NextResponse.json({ ok: true })
}
