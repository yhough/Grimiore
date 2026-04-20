import { db } from '@/db'
import { NextResponse } from 'next/server'

export async function PATCH(
  _req: Request,
  { params }: { params: { id: string; flagId: string } }
) {
  const flag = db
    .prepare('SELECT id FROM continuity_flags WHERE id = ? AND book_id = ?')
    .get(params.flagId, params.id)

  if (!flag) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  db.prepare('UPDATE continuity_flags SET resolved = 1, resolved_by = ? WHERE id = ?')
    .run('manual', params.flagId)

  return NextResponse.json({ ok: true })
}
