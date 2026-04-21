import { db } from '@/db'
import { NextResponse } from 'next/server'

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
