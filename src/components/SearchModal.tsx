'use client'

import { BookOpen, Clock, Hash, MapPin, ScrollText, Search, Shield, Sparkles, User, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

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

// ── Config ────────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<
  SearchResultType,
  { label: string; icon: React.ElementType; color: string; dot: string }
> = {
  character: { label: 'Characters',      icon: User,       color: 'text-blue-400',   dot: 'bg-blue-400'   },
  location:  { label: 'Locations',       icon: MapPin,     color: 'text-green-400',  dot: 'bg-green-400'  },
  faction:   { label: 'Factions',        icon: Shield,     color: 'text-amber-400',  dot: 'bg-amber-400'  },
  magic:     { label: 'Magic & Systems', icon: Sparkles,   color: 'text-violet-400', dot: 'bg-violet-400' },
  lore:      { label: 'World Lore',      icon: ScrollText, color: 'text-zinc-400',   dot: 'bg-zinc-400'   },
  chapter:   { label: 'Chapters',        icon: BookOpen,   color: 'text-indigo-400', dot: 'bg-indigo-400' },
  timeline:  { label: 'Timeline',        icon: Clock,      color: 'text-rose-400',   dot: 'bg-rose-400'   },
}

const GROUP_ORDER: SearchResultType[] = [
  'character', 'location', 'faction', 'magic', 'lore', 'chapter', 'timeline',
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function getSnippet(text: string, query: string, maxLen = 130): string {
  const lower = text.toLowerCase()
  const idx = lower.indexOf(query.toLowerCase())
  if (idx === -1) {
    return text.length > maxLen ? text.slice(0, maxLen) + '…' : text
  }
  const start = Math.max(0, idx - 35)
  const end = Math.min(text.length, idx + query.length + 80)
  return (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '')
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-primary/25 text-foreground rounded-sm not-italic">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  bookId: string
  open: boolean
  onClose: () => void
  onSelect: (result: SearchResult) => void
}

export function SearchModal({ bookId, open, onClose, onSelect }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('')
      setResults([])
      setFocusedIndex(-1)
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [open])

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim() || query.length < 1) {
      setResults([])
      setFocusedIndex(-1)
      return
    }
    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/books/${bookId}/search?q=${encodeURIComponent(query)}`)
        const data = (await res.json()) as SearchResult[]
        setResults(data)
        setFocusedIndex(-1)
      } catch { /* silent */ } finally {
        setLoading(false)
      }
    }, 200)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, bookId])

  // Scroll focused item into view
  useEffect(() => {
    if (focusedIndex < 0) return
    const el = listRef.current?.querySelector(`[data-idx="${focusedIndex}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [focusedIndex])

  if (!open) return null

  const grouped = GROUP_ORDER.flatMap((type) => results.filter((r) => r.type === type))

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') { onClose(); return }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusedIndex((i) => Math.min(grouped.length - 1, i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusedIndex((i) => Math.max(-1, i - 1))
    } else if (e.key === 'Enter') {
      if (focusedIndex >= 0 && grouped[focusedIndex]) {
        onSelect(grouped[focusedIndex])
      }
    }
  }

  // Build visual sections (group headers + results)
  const sections: Array<{ type: 'header'; label: string } | { type: 'result'; result: SearchResult; flatIndex: number }> = []
  let flatIdx = 0
  for (const type of GROUP_ORDER) {
    const group = results.filter((r) => r.type === type)
    if (!group.length) continue
    sections.push({ type: 'header', label: TYPE_CONFIG[type].label })
    for (const result of group) {
      sections.push({ type: 'result', result, flatIndex: flatIdx++ })
    }
  }

  const hasResults = results.length > 0
  const showEmpty = query.length >= 1 && !loading && !hasResults

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div
        className="relative z-10 w-full max-w-2xl mx-4 bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        {/* Search input row */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
          {loading
            ? <svg className="animate-spin shrink-0 text-muted-foreground" style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="none">
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            : <Search size={16} className="shrink-0 text-muted-foreground" />
          }
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search characters, lore, chapters, timeline…"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
          />
          {query && (
            <button onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus() }} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
              <X size={14} />
            </button>
          )}
          <kbd className="shrink-0 text-[10px] text-muted-foreground/50 font-mono bg-muted px-1.5 py-0.5 rounded border border-border">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto overscroll-contain">
          {!query && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Hash size={20} className="text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground/50">
                Type to search across your world
              </p>
            </div>
          )}

          {showEmpty && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-muted-foreground/50">
                No results for <span className="text-muted-foreground font-medium">"{query}"</span>
              </p>
            </div>
          )}

          {hasResults && (
            <div className="py-2">
              {sections.map((section, i) => {
                if (section.type === 'header') {
                  return (
                    <p key={`h-${i}`} className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                      {section.label}
                    </p>
                  )
                }

                const { result, flatIndex } = section
                const cfg = TYPE_CONFIG[result.type]
                const Icon = cfg.icon
                const isFocused = focusedIndex === flatIndex
                const snippetText = result.snippet ? getSnippet(result.snippet, query) : null

                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    data-idx={flatIndex}
                    onClick={() => onSelect(result)}
                    onMouseEnter={() => setFocusedIndex(flatIndex)}
                    className={`w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors ${
                      isFocused ? 'bg-muted' : 'hover:bg-muted/50'
                    }`}
                  >
                    <Icon size={14} className={`shrink-0 mt-0.5 ${cfg.color}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-medium text-foreground truncate">
                          <Highlight text={result.name} query={query} />
                        </span>
                        {result.meta && (
                          <span className="shrink-0 text-[10px] text-muted-foreground/50 font-medium">
                            {result.meta}
                          </span>
                        )}
                      </div>
                      {snippetText && (
                        <p className="text-xs text-muted-foreground/70 mt-0.5 leading-relaxed line-clamp-2">
                          <Highlight text={snippetText} query={query} />
                        </p>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer hint */}
        {hasResults && (
          <div className="flex items-center gap-4 px-4 py-2 border-t border-border">
            <span className="text-[10px] text-muted-foreground/40">
              <kbd className="font-mono">↑↓</kbd> navigate
            </span>
            <span className="text-[10px] text-muted-foreground/40">
              <kbd className="font-mono">↵</kbd> select
            </span>
            <span className="ml-auto text-[10px] text-muted-foreground/30">
              {results.length} result{results.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
