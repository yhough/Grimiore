import { db } from '@/db'
import { NextResponse } from 'next/server'

export async function DELETE(
  _: Request,
  { params }: { params: { id: string; chapterId: string; annotationId: string } }
) {
  const exists = db
    .prepare('SELECT id FROM chapter_annotations WHERE id = ? AND chapter_id = ? AND book_id = ?')
    .get(params.annotationId, params.chapterId, params.id)

  if (!exists) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  db.prepare('DELETE FROM chapter_annotations WHERE id = ?').run(params.annotationId)
  return NextResponse.json({ ok: true })
}
