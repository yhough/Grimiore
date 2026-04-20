import { db } from '@/db'
import { generateId } from '@/lib/utils'
import { NextResponse } from 'next/server'

export async function POST(
  _: Request,
  { params }: { params: { id: string; cardId: string } }
) {
  const card = db
    .prepare('SELECT * FROM ripple_cards WHERE id = ? AND book_id = ?')
    .get(params.cardId, params.id) as
    | { id: string; title: string; description: string; book_id: string }
    | undefined

  if (!card) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Mark accepted
  db.prepare(
    'UPDATE ripple_cards SET status = ? WHERE id = ?'
  ).run('accepted', params.cardId)

  // Log as a book state entry (canon fact)
  db.prepare(
    `INSERT INTO book_state_entries
       (id, book_id, type, name, summary, data, source, source_id, created_at, updated_at)
     VALUES (?, ?, 'world_fact', ?, ?, '{}', 'chat', ?, ?, ?)`
  ).run(
    generateId(),
    params.id,
    card.title,
    card.description,
    card.id,
    Date.now(),
    Date.now()
  )

  // Bump book updated_at
  db.prepare('UPDATE books SET updated_at = ? WHERE id = ?').run(Date.now(), params.id)

  return NextResponse.json({ ok: true })
}
