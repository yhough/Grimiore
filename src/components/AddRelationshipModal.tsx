'use client'

import { useMemo, useState } from 'react'
import { X, MessageSquare } from 'lucide-react'
import type { CharacterFull } from './CharacterDetailSlideOver'

const REL_TYPES = ['ally', 'enemy', 'neutral', 'romantic', 'family', 'mentor', 'rival', 'unknown'] as const
const REL_STATUSES = ['active', 'strained', 'broken', 'unknown'] as const

const TYPE_LABELS: Record<string, string> = {
  ally: 'Ally', enemy: 'Enemy', neutral: 'Neutral', romantic: 'Romantic',
  family: 'Family', mentor: 'Mentor', rival: 'Rival', unknown: 'Unknown',
}
const STATUS_LABELS: Record<string, string> = {
  active: 'Active', strained: 'Strained', broken: 'Broken', unknown: 'Unknown',
}

const inputCls =
  'px-2.5 py-1.5 rounded-md border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring w-full'

interface Props {
  open: boolean
  characters: CharacterFull[]
  onClose: () => void
  onAddViaChat: (message: string) => void
}

function buildChatMessage(
  nameA: string,
  nameB: string,
  type: string,
  status: string,
  strength: number,
  description: string
): string {
  const typeLabel = TYPE_LABELS[type]?.toLowerCase() ?? type
  const statusLabel = STATUS_LABELS[status]?.toLowerCase() ?? status

  const parts: string[] = [
    `Establish that ${nameA} and ${nameB} share a ${typeLabel} relationship (strength ${strength}/5, ${statusLabel}).`,
  ]
  if (description.trim()) parts.push(description.trim())
  return parts.join(' ')
}

export function AddRelationshipModal({ open, characters, onClose, onAddViaChat }: Props) {
  const [charA, setCharA] = useState('')
  const [charB, setCharB] = useState('')
  const [type, setType] = useState<string>('unknown')
  const [status, setStatus] = useState<string>('unknown')
  const [strength, setStrength] = useState(1)
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  const charMap = useMemo(() => new Map(characters.map((c) => [c.id, c])), [characters])

  const preview = useMemo(() => {
    const a = charMap.get(charA)
    const b = charMap.get(charB)
    if (!a || !b) return null
    return buildChatMessage(a.name, b.name, type, status, strength, description)
  }, [charA, charB, type, status, strength, description, charMap])

  function reset() {
    setCharA(''); setCharB(''); setType('unknown'); setStatus('unknown')
    setStrength(1); setDescription(''); setError('')
  }

  function handleClose() { reset(); onClose() }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!charA) { setError('Select the first character.'); return }
    if (!charB) { setError('Select the second character.'); return }
    if (charA === charB) { setError('A character cannot relate to itself.'); return }
    if (!preview) return
    onAddViaChat(preview)
    reset()
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md bg-card border border-border rounded-xl shadow-xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Add relationship via chat</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Claude will establish it through the world chat to maintain continuity.</p>
          </div>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors ml-4 shrink-0">
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-5 flex flex-col gap-4">
          {/* Characters */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Character A', value: charA, onChange: setCharA },
              { label: 'Character B', value: charB, onChange: setCharB },
            ].map(({ label, value, onChange }) => (
              <div key={label} className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                  {label}
                </label>
                <select
                  value={value}
                  onChange={(e) => { onChange(e.target.value); setError('') }}
                  className={inputCls}
                >
                  <option value="">Select…</option>
                  {characters.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* Type + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>
                {REL_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
                {REL_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>
          </div>

          {/* Strength */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Strength — {strength} / 5
            </label>
            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setStrength(i + 1)}
                  className={`w-6 h-6 rounded-full border transition-colors ${
                    i < strength
                      ? 'bg-primary border-primary'
                      : 'bg-transparent border-border hover:border-primary/50'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Description <span className="normal-case font-normal text-muted-foreground/40">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="One sentence describing this relationship…"
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Chat preview */}
          {preview && (
            <div className="rounded-lg border border-border bg-muted/40 px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-1.5">
                Will be sent to chat
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed italic">"{preview}"</p>
            </div>
          )}

          {error && <p className="text-sm text-destructive -mt-1">{error}</p>}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              className="flex flex-1 items-center justify-center gap-1.5 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <MessageSquare size={13} />
              Add via chat
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
