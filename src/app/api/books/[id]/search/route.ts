import { db } from '@/db'
import { NextResponse } from 'next/server'

export type SearchResultType =
  | 'character'
  | 'location'
  | 'faction'
  | 'magic'
  | 'lore'
  | 'chapter'
  | 'timeline'

export interface SearchResult {
  id: string
  type: SearchResultType
  name: string
  snippet: string | null
  meta: string | null
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const q = new URL(req.url).searchParams.get('q')?.trim() ?? ''
  if (q.length < 1) return NextResponse.json([])

  const like = `%${q}%`
  const results: SearchResult[] = []

  // Characters — search name, description, and JSON data (traits, moments)
  const chars = db
    .prepare(
      `SELECT id, name, description, role, status, data
       FROM characters WHERE book_id = ?
       AND (name LIKE ? OR description LIKE ? OR data LIKE ?)
       LIMIT 5`
    )
    .all(params.id, like, like, like) as Array<{
      id: string; name: string; description: string | null
      role: string; status: string; data: string
    }>

  for (const c of chars) {
    let snippet = c.description
    // If the match is in the data (traits/moments), surface that instead
    if (!snippet?.toLowerCase().includes(q.toLowerCase())) {
      try {
        const d = JSON.parse(c.data) as { traits?: string[]; notable_moments?: string[] }
        const hit = [...(d.traits ?? []), ...(d.notable_moments ?? [])].find((t) =>
          t.toLowerCase().includes(q.toLowerCase())
        )
        if (hit) snippet = hit
      } catch { /* ok */ }
    }
    results.push({ id: c.id, type: 'character', name: c.name, snippet, meta: c.role })
  }

  // Lore entries — name and summary
  const lore = db
    .prepare(
      `SELECT id, name, summary, type, data
       FROM book_state_entries WHERE book_id = ?
       AND (name LIKE ? OR summary LIKE ?)
       LIMIT 8`
    )
    .all(params.id, like, like) as Array<{
      id: string; name: string; summary: string | null; type: string; data: string
    }>

  for (const e of lore) {
    let type: SearchResultType = 'lore'
    if (e.type === 'location') type = 'location'
    else if (e.type === 'faction') type = 'faction'
    else if (e.type === 'misc') {
      try {
        if ((JSON.parse(e.data) as { category?: string }).category === 'magic') type = 'magic'
      } catch { /* ok */ }
    }
    results.push({ id: e.id, type, name: e.name, snippet: e.summary, meta: null })
  }

  // Chapters — title and AI summary (not raw content — too large)
  const chapters = db
    .prepare(
      `SELECT id, number, title, summary
       FROM chapters WHERE book_id = ?
       AND (title LIKE ? OR summary LIKE ?)
       LIMIT 5`
    )
    .all(params.id, like, like) as Array<{
      id: string; number: number; title: string; summary: string | null
    }>

  for (const ch of chapters) {
    results.push({
      id: ch.id,
      type: 'chapter',
      name: ch.title,
      snippet: ch.summary,
      meta: `Ch. ${ch.number}`,
    })
  }

  // Timeline events
  const timeline = db
    .prepare(
      `SELECT id, title, description
       FROM timeline_events WHERE book_id = ?
       AND (title LIKE ? OR description LIKE ?)
       AND (is_correction IS NULL OR is_correction = 0)
       LIMIT 5`
    )
    .all(params.id, like, like) as Array<{
      id: string; title: string; description: string | null
    }>

  for (const e of timeline) {
    results.push({ id: e.id, type: 'timeline', name: e.title, snippet: e.description, meta: null })
  }

  return NextResponse.json(results)
}
