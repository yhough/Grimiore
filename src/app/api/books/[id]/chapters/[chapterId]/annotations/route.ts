import { db } from '@/db'
import { generateId } from '@/lib/utils'
import { NextResponse } from 'next/server'

type Ctx = { params: { id: string; chapterId: string } }

export async function GET(_: Request, { params }: Ctx) {
  const rows = db
    .prepare(
      'SELECT id, text, created_at FROM chapter_annotations WHERE chapter_id = ? AND book_id = ? ORDER BY created_at ASC'
    )
    .all(params.chapterId, params.id)
  return NextResponse.json(rows)
}

export async function POST(req: Request, { params }: Ctx) {
  const { text } = await req.json() as { text: string }
  if (!text?.trim()) return NextResponse.json({ error: 'text required' }, { status: 400 })

  const chapter = db
    .prepare('SELECT id FROM chapters WHERE id = ? AND book_id = ?')
    .get(params.chapterId, params.id)
  if (!chapter) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const id = generateId()
  const now = Date.now()
  db.prepare(
    'INSERT INTO chapter_annotations (id, chapter_id, book_id, text, created_at) VALUES (?, ?, ?, ?, ?)'
  ).run(id, params.chapterId, params.id, text.trim(), now)

  return NextResponse.json({ id, text: text.trim(), created_at: now })
}
