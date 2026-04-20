import { db } from '@/db'
import { NextResponse } from 'next/server'

export async function POST(
  _: Request,
  { params }: { params: { id: string; cardId: string } }
) {
  const exists = db
    .prepare('SELECT id FROM ripple_cards WHERE id = ? AND book_id = ?')
    .get(params.cardId, params.id)

  if (!exists) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  db.prepare('UPDATE ripple_cards SET status = ? WHERE id = ?').run('dismissed', params.cardId)

  return NextResponse.json({ ok: true })
}
