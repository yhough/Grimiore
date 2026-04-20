import { db } from '@/db'
import { NextResponse } from 'next/server'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const messages = db
    .prepare(
      `SELECT id, role, content, metadata, created_at
       FROM chat_messages
       WHERE book_id = ? AND character_id IS NULL
       ORDER BY created_at ASC`
    )
    .all(params.id) as Array<{
      id: string
      role: string
      content: string
      metadata: string
      created_at: number
    }>

  // Attach ripple cards to each message
  const withRipples = messages.map((msg) => {
    const ripples = db
      .prepare(
        `SELECT id, title, description, status FROM ripple_cards
         WHERE message_id = ? ORDER BY created_at ASC`
      )
      .all(msg.id)
    return { ...msg, ripple_cards: ripples }
  })

  return NextResponse.json(withRipples)
}
