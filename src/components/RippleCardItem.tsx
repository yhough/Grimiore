'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { useState } from 'react'

interface RippleCard {
  id: string
  title: string
  description: string
  status: 'pending' | 'accepted' | 'dismissed'
}

interface Props {
  card: RippleCard
  bookId: string
  onAccepted: () => void  // triggers lore refetch
}

export function RippleCardItem({ card, bookId, onAccepted }: Props) {
  const [status, setStatus] = useState<RippleCard['status']>(card.status)
  const [visible, setVisible] = useState(true)

  async function accept() {
    setStatus('accepted')
    await fetch(`/api/books/${bookId}/world/ripple/${card.id}/accept`, { method: 'POST' })
    onAccepted()
  }

  async function dismiss() {
    await fetch(`/api/books/${bookId}/world/ripple/${card.id}/dismiss`, { method: 'POST' })
    // brief delay then slide away
    setTimeout(() => setVisible(false), 80)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          layout
          initial={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, x: -12, transition: { duration: 0.2 } }}
          className="shrink-0 w-64 rounded-lg border border-amber-300/30 bg-amber-50/60 p-3 flex flex-col gap-2"
        >
          {status === 'accepted' ? (
            <div className="flex items-center gap-1.5 py-1 text-green-700">
              <Check size={13} />
              <span className="text-xs font-medium">Added to canon</span>
            </div>
          ) : (
            <>
              <div className="flex-1">
                <p className="text-xs font-medium text-amber-900 leading-snug mb-1">{card.title}</p>
                <p className="text-xs text-amber-800/80 leading-relaxed">{card.description}</p>
              </div>
              <div className="flex items-center gap-1.5 pt-1 border-t border-amber-300/30">
                <button
                  onClick={accept}
                  className="flex-1 text-[11px] font-medium text-amber-900 bg-amber-200/60 hover:bg-amber-200 rounded px-2 py-1 transition-colors"
                >
                  Add to canon
                </button>
                <button
                  onClick={dismiss}
                  className="p-1 rounded text-amber-700/60 hover:text-amber-900 hover:bg-amber-200/40 transition-colors"
                  title="Dismiss"
                >
                  <X size={12} />
                </button>
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
