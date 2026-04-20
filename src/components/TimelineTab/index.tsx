'use client'

import { mockTimelineEvents } from '@/lib/mock-data'
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Clock,
  MessageSquare,
  Scroll,
  Search,
} from 'lucide-react'
import { useState } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────

type TLEvent = typeof mockTimelineEvents[0]
type Density = 'compact' | 'normal' | 'expanded'
type CategoryFilter = 'all' | 'historical' | 'political' | 'conflict' | 'mystery' | 'economic' | 'story'
type SourceFilter = 'all' | 'world_chat' | 'chapter'

// ── Config ────────────────────────────────────────────────────────────────────

const CAT: Record<string, { label: string; color: string }> = {
  historical: { label: 'Historical', color: 'hsl(var(--grimm-muted))' },
  political:  { label: 'Political',  color: '#5a7a8a' },
  conflict:   { label: 'Conflict',   color: 'hsl(var(--grimm-danger))' },
  mystery:    { label: 'Mystery',    color: '#8a5a8a' },
  economic:   { label: 'Economic',   color: 'hsl(var(--grimm-success-text))' },
  story:      { label: 'Story',      color: 'hsl(var(--grimm-accent))' },
}

const CAT_ORDER: CategoryFilter[] = ['all', 'historical', 'political', 'conflict', 'mystery', 'economic', 'story']

const DENSITY_CFG = {
  compact:  { gap: 16, pv: 10, ph: 12 },
  normal:   { gap: 32, pv: 16, ph: 18 },
  expanded: { gap: 48, pv: 20, ph: 22 },
}

const ALL_CHARS = Array.from(
  new Set(mockTimelineEvents.flatMap((e) => e.characters))
).filter(Boolean)

// ── Helpers ───────────────────────────────────────────────────────────────────

function catColor(cat: string): string {
  return CAT[cat]?.color ?? 'hsl(var(--grimm-muted))'
}

function srcInfo(source: string): { icon: React.ReactNode; text: string } {
  if (source === 'world_chat')
    return { icon: <MessageSquare size={10} />, text: 'World' }
  const num = source.replace('chapter_', '')
  return { icon: <BookOpen size={10} />, text: `Ch. ${num}` }
}

function hl(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text
  const esc = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(`(${esc})`, 'gi')
  const parts = text.split(re)
  return (
    <>
      {parts.map((p, i) =>
        re.test(p) ? (
          <span
            key={i}
            style={{
              backgroundColor: 'hsl(var(--grimm-accent) / 0.15)',
              color: 'hsl(var(--grimm-accent))',
              borderRadius: 2,
              padding: '0 1px',
            }}
          >
            {p}
          </span>
        ) : (
          p
        )
      )}
    </>
  )
}

function matchesSearch(e: TLEvent, q: string): boolean {
  if (!q.trim()) return true
  const s = q.toLowerCase()
  return (
    e.title.toLowerCase().includes(s) ||
    (e.description?.toLowerCase().includes(s) ?? false) ||
    (e.inStoryDate?.toLowerCase().includes(s) ?? false) ||
    e.characters.some((c) => c.toLowerCase().includes(s))
  )
}

// ── Filter Pill ───────────────────────────────────────────────────────────────

function FilterPill({
  label,
  active,
  color,
  dot,
  icon,
  onClick,
}: {
  label: string
  active: boolean
  color?: string
  dot?: boolean
  icon?: React.ReactNode
  onClick: () => void
}) {
  const dotEl = dot && color ? (
    <span
      style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        backgroundColor: color,
        flexShrink: 0,
        opacity: active ? 1 : 0.6,
      }}
    />
  ) : null

  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '5px 12px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: active ? 500 : 400,
        cursor: 'pointer',
        border: active
          ? `0.5px solid ${color ? color + '80' : 'hsl(var(--grimm-accent) / 0.5)'}`
          : '0.5px solid hsl(var(--grimm-border))',
        backgroundColor: active
          ? color
            ? color + '26' // ~15% opacity hex
            : 'hsl(var(--grimm-accent) / 0.15)'
          : 'hsl(var(--grimm-surface-raised))',
        color: active
          ? color ?? 'hsl(var(--grimm-accent))'
          : 'hsl(var(--grimm-muted))',
        transition: 'all 150ms ease',
        whiteSpace: 'nowrap',
      }}
    >
      {dotEl}
      {icon}
      {label}
    </button>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  count,
  label,
}: {
  icon: React.ReactNode
  count: number
  label: string
}) {
  return (
    <div
      style={{
        flex: 1,
        backgroundColor: 'hsl(var(--grimm-surface))',
        border: '0.5px solid hsl(var(--grimm-border))',
        borderRadius: 8,
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <span style={{ color: 'hsl(var(--grimm-muted))', flexShrink: 0 }}>{icon}</span>
      <div>
        <p style={{ color: 'hsl(var(--grimm-text))', fontSize: 16, fontWeight: 500, lineHeight: 1.2 }}>
          {count}
        </p>
        <p style={{ color: 'hsl(var(--grimm-muted))', fontSize: 12 }}>{label}</p>
      </div>
    </div>
  )
}

// ── Event Card (inside a node) ────────────────────────────────────────────────

function EventCard({
  event,
  isExpanded,
  forceExpand,
  onToggle,
  searchQuery,
  pv,
  ph,
}: {
  event: TLEvent
  isExpanded: boolean
  forceExpand: boolean
  onToggle: () => void
  searchQuery: string
  pv: number
  ph: number
}) {
  const color = catColor(event.category)
  const catLabel = CAT[event.category]?.label ?? event.category
  const src = srcInfo(event.source)
  const showExpand = !forceExpand && (event.description?.length ?? 0) > 80
  const expanded = forceExpand || isExpanded

  const [dotHover, setDotHover] = useState(false)

  return (
    <div
      onClick={onToggle}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = color + '66'
        el.style.transform = 'translateX(0)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = 'hsl(var(--grimm-border))'
        el.style.transform = 'translateX(0)'
      }}
      style={{
        backgroundColor: 'hsl(var(--grimm-surface))',
        border: '0.5px solid hsl(var(--grimm-border))',
        borderRadius: 10,
        padding: `${pv}px ${ph}px`,
        cursor: 'pointer',
        transition: 'border-color 150ms ease, transform 150ms ease',
        width: '100%',
      }}
    >
      {/* Top row: category + source */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: color,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                color,
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 500,
              }}
            >
              {catLabel}
            </span>
          </div>
          <p
            style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: 15,
              fontWeight: 600,
              color: 'hsl(var(--grimm-text))',
              marginTop: 4,
              lineHeight: 1.4,
            }}
          >
            {hl(event.title, searchQuery)}
          </p>
        </div>

        {/* Source badge */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            backgroundColor: 'hsl(var(--grimm-surface-raised))',
            border: '0.5px solid hsl(var(--grimm-border))',
            color: 'hsl(var(--grimm-muted))',
            fontSize: 11,
            padding: '2px 8px',
            borderRadius: 20,
            flexShrink: 0,
          }}
        >
          {src.icon}
          {src.text}
        </span>
      </div>

      {/* In-story date */}
      {event.inStoryDate && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            marginTop: 8,
          }}
        >
          <Clock size={12} style={{ color: 'hsl(var(--grimm-muted))', flexShrink: 0 }} />
          <span
            style={{
              color: 'hsl(var(--grimm-muted))',
              fontSize: 12,
              fontStyle: 'italic',
              fontFamily: 'var(--font-playfair)',
            }}
          >
            {hl(event.inStoryDate, searchQuery)}
          </span>
        </div>
      )}

      {/* Characters */}
      {event.characters.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
          {event.characters.map((c) => (
            <span
              key={c}
              style={{
                backgroundColor: 'hsl(var(--grimm-surface-raised))',
                border: '0.5px solid hsl(var(--grimm-border))',
                color: 'hsl(var(--grimm-muted))',
                fontSize: 11,
                padding: '2px 8px',
                borderRadius: 20,
              }}
            >
              {hl(c, searchQuery)}
            </span>
          ))}
        </div>
      )}

      {/* Expanded description */}
      <div
        style={{
          maxHeight: expanded ? 400 : 0,
          overflow: 'hidden',
          transition: 'max-height 250ms ease, opacity 250ms ease',
          opacity: expanded ? 1 : 0,
        }}
      >
        {event.description && (
          <p
            className="voice-of-world"
            style={{
              color: 'hsl(var(--grimm-text))',
              fontSize: 13,
              lineHeight: 1.8,
              marginTop: 12,
              paddingTop: 12,
              borderTop: '0.5px solid hsl(var(--grimm-border))',
            }}
          >
            {hl(event.description, searchQuery)}
          </p>
        )}
      </div>

      {/* Expand indicator */}
      {showExpand && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            marginTop: 10,
            color: 'hsl(var(--grimm-muted))',
            fontSize: 11,
          }}
        >
          {isExpanded ? (
            <>Show less <ChevronUp size={12} /></>
          ) : (
            <>Read more <ChevronDown size={12} /></>
          )}
        </div>
      )}
    </div>
  )
}

// ── Timeline Node (dot + card + date) ─────────────────────────────────────────

function TimelineNode({
  event,
  index,
  isExpanded,
  forceExpand,
  onToggle,
  searchQuery,
  pv,
  ph,
}: {
  event: TLEvent
  index: number
  isExpanded: boolean
  forceExpand: boolean
  onToggle: () => void
  searchQuery: string
  pv: number
  ph: number
}) {
  const isLeft = index % 2 === 0
  const color = catColor(event.category)
  const delay = Math.min(index * 60, 600)

  const [dotHover, setDotHover] = useState(false)

  // Slot width: half container minus connector(40px) minus dot-half(7px) minus small gap
  // Layout: [slot: calc(50% - 47px)] [connector 40px] [dot 14px] [connector 40px] [slot: calc(50% - 47px)]
  // Total: (50%-47)+(40)+(14)+(40)+(50%-47) = 100% + 0 ✓

  const cardSlot = (
    <EventCard
      event={event}
      isExpanded={isExpanded}
      forceExpand={forceExpand}
      onToggle={onToggle}
      searchQuery={searchQuery}
      pv={pv}
      ph={ph}
    />
  )

  const dateSlot = event.inStoryDate ? (
    <p
      style={{
        color: 'hsl(var(--grimm-muted))',
        fontSize: 11,
        textAlign: isLeft ? 'left' : 'right',
        paddingLeft: isLeft ? 8 : 0,
        paddingRight: isLeft ? 0 : 8,
      }}
    >
      {event.inStoryDate}
    </p>
  ) : null

  const dot = (
    <div
      onMouseEnter={() => setDotHover(true)}
      onMouseLeave={() => setDotHover(false)}
      style={{
        width: 14,
        height: 14,
        borderRadius: '50%',
        backgroundColor: color,
        border: '2px solid hsl(var(--background))',
        flexShrink: 0,
        zIndex: 2,
        transition: 'transform 150ms ease, box-shadow 150ms ease',
        transform: dotHover ? 'scale(1.4)' : 'scale(1)',
        boxShadow: dotHover ? `0 0 0 4px ${color}66` : 'none',
      }}
    />
  )

  // Empty 40px spacer (opposite side from connector)
  const spacer = <div style={{ width: 40, flexShrink: 0 }} />
  const connector = (
    <div
      style={{
        width: 40,
        height: 0,
        borderTop: '1px dashed hsl(var(--grimm-border))',
        flexShrink: 0,
      }}
    />
  )

  return (
    <div
      className="grimm-event-node"
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        animationDelay: `${delay}ms`,
      }}
    >
      {/* Left slot */}
      <div
        style={{
          flex: '0 0 calc(50% - 47px)',
          display: 'flex',
          justifyContent: isLeft ? 'flex-end' : 'flex-start',
        }}
      >
        {isLeft ? cardSlot : dateSlot}
      </div>

      {/* Connector left side */}
      {isLeft ? connector : spacer}

      {/* Dot */}
      {dot}

      {/* Connector right side */}
      {isLeft ? spacer : connector}

      {/* Right slot */}
      <div
        style={{
          flex: '0 0 calc(50% - 47px)',
          display: 'flex',
          justifyContent: isLeft ? 'flex-start' : 'flex-end',
        }}
      >
        {isLeft ? dateSlot : cardSlot}
      </div>
    </div>
  )
}

// ── Present Marker ────────────────────────────────────────────────────────────

function PresentMarker() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <div
        className="grimm-present-marker"
        style={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          backgroundColor: 'hsl(var(--grimm-accent))',
          border: '2px solid hsl(var(--background))',
          zIndex: 2,
          flexShrink: 0,
        }}
      />
      <div>
        <p style={{ color: 'hsl(var(--grimm-accent))', fontSize: 12, fontWeight: 500 }}>
          Present
        </p>
        <p style={{ color: 'hsl(var(--grimm-muted))', fontSize: 11, fontStyle: 'italic', marginTop: 2 }}>
          The story continues...
        </p>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function TimelineTab() {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [characterFilter, setCharacterFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedEventId, setExpandedEventId] = useState<string | null>('tl-5')
  const [density, setDensity] = useState<Density>('normal')

  const dcfg = DENSITY_CFG[density]
  const forceExpand = density === 'expanded'

  // ── filtering ──
  const filteredEvents = mockTimelineEvents.filter((e) => {
    if (categoryFilter !== 'all' && e.category !== categoryFilter) return false
    if (characterFilter !== 'all' && !e.characters.includes(characterFilter)) return false
    if (sourceFilter === 'world_chat' && e.source !== 'world_chat') return false
    if (sourceFilter === 'chapter' && !e.source.startsWith('chapter_')) return false
    if (!matchesSearch(e, searchQuery)) return false
    return true
  })

  // ── stats ──
  const totalEvents = mockTimelineEvents.length
  const fromChapters = mockTimelineEvents.filter((e) => e.source.startsWith('chapter_')).length
  const fromChat = mockTimelineEvents.filter((e) => e.source === 'world_chat').length

  function clearFilters() {
    setCategoryFilter('all')
    setCharacterFilter('all')
    setSourceFilter('all')
    setSearchQuery('')
  }

  return (
    <div className="h-full overflow-y-auto">
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '32px 24px' }}>

        {/* ── Tab header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: 24,
                color: 'hsl(var(--grimm-text))',
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Timeline
            </h1>
            <p style={{ color: 'hsl(var(--grimm-muted))', fontSize: 13, marginTop: 4 }}>
              A complete record of your world&apos;s history
            </p>
          </div>
          <span
            style={{
              backgroundColor: 'hsl(var(--grimm-surface-raised))',
              color: 'hsl(var(--grimm-muted))',
              fontSize: 12,
              padding: '4px 10px',
              borderRadius: 20,
              marginTop: 4,
              flexShrink: 0,
            }}
          >
            {totalEvents} events
          </span>
        </div>

        {/* ── Filter controls ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>

          {/* Row 1 — category filters */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CAT_ORDER.map((cat) => (
              <FilterPill
                key={cat}
                label={cat === 'all' ? 'All' : CAT[cat].label}
                active={categoryFilter === cat}
                color={cat === 'all' ? undefined : CAT[cat].color}
                dot={cat !== 'all'}
                onClick={() => setCategoryFilter(cat)}
              />
            ))}
          </div>

          {/* Row 2 — character + source filters */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            {/* Character filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ color: 'hsl(var(--grimm-muted))', fontSize: 12, flexShrink: 0 }}>
                Character
              </span>
              <FilterPill
                label="All"
                active={characterFilter === 'all'}
                onClick={() => setCharacterFilter('all')}
              />
              {ALL_CHARS.map((char) => (
                <FilterPill
                  key={char}
                  label={char}
                  active={characterFilter === char}
                  onClick={() => setCharacterFilter(char)}
                />
              ))}
            </div>

            {/* Source filter */}
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <FilterPill
                label="All sources"
                active={sourceFilter === 'all'}
                onClick={() => setSourceFilter('all')}
              />
              <FilterPill
                label="World chat"
                active={sourceFilter === 'world_chat'}
                icon={<MessageSquare size={10} />}
                onClick={() => setSourceFilter('world_chat')}
              />
              <FilterPill
                label="Chapters"
                active={sourceFilter === 'chapter'}
                icon={<BookOpen size={10} />}
                onClick={() => setSourceFilter('chapter')}
              />
            </div>
          </div>
        </div>

        {/* ── Stats bar ── */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
          <StatCard icon={<Clock size={14} />} count={totalEvents} label="events logged" />
          <StatCard icon={<BookOpen size={14} />} count={fromChapters} label="from chapters" />
          <StatCard icon={<MessageSquare size={14} />} count={fromChat} label="from world chat" />
        </div>

        {/* ── Search + density ── */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 32, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'hsl(var(--grimm-muted))',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events, characters, or dates..."
              style={{
                width: '100%',
                backgroundColor: 'hsl(var(--grimm-surface))',
                border: '0.5px solid hsl(var(--grimm-border))',
                color: 'hsl(var(--grimm-text))',
                padding: '10px 14px 10px 36px',
                borderRadius: 8,
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Density control */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'hsl(var(--grimm-surface-raised))',
              border: '0.5px solid hsl(var(--grimm-border))',
              borderRadius: 20,
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            {(['compact', 'normal', 'expanded'] as Density[]).map((d) => (
              <button
                key={d}
                onClick={() => setDensity(d)}
                style={{
                  padding: '6px 12px',
                  fontSize: 12,
                  fontWeight: density === d ? 500 : 400,
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: density === d ? 'hsl(var(--grimm-accent) / 0.15)' : 'transparent',
                  color: density === d ? 'hsl(var(--grimm-accent))' : 'hsl(var(--grimm-muted))',
                  transition: 'all 200ms ease',
                  textTransform: 'capitalize',
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* ── Timeline ── */}
        {filteredEvents.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '60px 0',
              textAlign: 'center',
            }}
          >
            <Scroll size={40} style={{ color: 'hsl(var(--grimm-muted))' }} />
            <p
              style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: 18,
                color: 'hsl(var(--grimm-text))',
                marginTop: 16,
              }}
            >
              No events match your filters
            </p>
            <p style={{ color: 'hsl(var(--grimm-muted))', fontSize: 13, marginTop: 6 }}>
              Try adjusting your filters or search
            </p>
            <button
              onClick={clearFilters}
              style={{
                backgroundColor: 'hsl(var(--grimm-surface-raised))',
                color: 'hsl(var(--grimm-muted))',
                border: '0.5px solid hsl(var(--grimm-border))',
                padding: '6px 16px',
                borderRadius: 6,
                fontSize: 12,
                cursor: 'pointer',
                marginTop: 16,
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            {/* Spine */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: 0,
                bottom: 0,
                width: 1,
                transform: 'translateX(-50%)',
                background:
                  'linear-gradient(to bottom, hsl(var(--grimm-border)), transparent)',
                pointerEvents: 'none',
              }}
            />

            {/* Events */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: dcfg.gap,
                transition: 'gap 200ms ease',
                position: 'relative',
              }}
            >
              {filteredEvents.map((event, index) => (
                <TimelineNode
                  key={event.id}
                  event={event}
                  index={index}
                  isExpanded={expandedEventId === event.id}
                  forceExpand={forceExpand}
                  onToggle={() =>
                    setExpandedEventId((prev) => (prev === event.id ? null : event.id))
                  }
                  searchQuery={searchQuery}
                  pv={dcfg.pv}
                  ph={dcfg.ph}
                />
              ))}
            </div>

            {/* Present marker */}
            <div style={{ marginTop: 32, position: 'relative', zIndex: 2 }}>
              <PresentMarker />
            </div>

            {/* Bottom padding */}
            <div style={{ height: 80 }} />
          </div>
        )}
      </div>
    </div>
  )
}
