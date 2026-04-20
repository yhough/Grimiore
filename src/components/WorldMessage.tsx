'use client'

import { ContradictionAlert } from '@/components/ContradictionAlert'
import { RippleCardItem } from '@/components/RippleCardItem'
import type { ChatMetadata, Contradiction } from '@/types'

interface RippleCard {
  id: string
  title: string
  description: string
  status: 'pending' | 'accepted' | 'dismissed'
}

export interface WorldMessageData {
  id: string
  role: 'user' | 'assistant'
  content: string
  metadata: string
  created_at: number
  ripple_cards: RippleCard[]
}

interface Props {
  message: WorldMessageData
  bookId: string
  onRippleAccepted: () => void
  onContradictionOverride?: (messageId: string) => void
  onContradictionCancel?: (messageId: string) => void
}

export function WorldMessage({
  message,
  bookId,
  onRippleAccepted,
  onContradictionOverride,
  onContradictionCancel,
}: Props) {
  let meta: ChatMetadata = {}
  try { meta = JSON.parse(message.metadata) } catch { /* ok */ }

  const contradictions: Contradiction[] = meta.contradictions ?? []
  const pendingRipples = message.ripple_cards.filter((c) => c.status !== 'dismissed')

  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] px-4 py-2.5 rounded-2xl rounded-tr-sm bg-amber-50 border border-amber-200/60 text-sm text-foreground leading-relaxed">
          {message.content}
        </div>
      </div>
    )
  }

  // AI message
  return (
    <div className="flex flex-col gap-3">
      {/* Contradiction alert — above response */}
      {contradictions.map((c, i) => (
        <ContradictionAlert
          key={i}
          contradiction={c}
          onOverride={() => onContradictionOverride?.(message.id)}
          onCancel={() => onContradictionCancel?.(message.id)}
        />
      ))}

      {/* AI response bubble */}
      <div className="flex items-start gap-3 max-w-[75%]">
        <div
          className="px-4 py-3 rounded-2xl rounded-tl-sm bg-card border border-border text-sm leading-relaxed text-foreground"
          style={{ fontFamily: 'var(--font-playfair)', fontStyle: 'italic' }}
        >
          {message.content}
        </div>
      </div>

      {/* Ripple cards */}
      {pendingRipples.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 pl-0 scrollbar-thin">
          {pendingRipples.map((card) => (
            <RippleCardItem
              key={card.id}
              card={card}
              bookId={bookId}
              onAccepted={onRippleAccepted}
            />
          ))}
        </div>
      )}
    </div>
  )
}
