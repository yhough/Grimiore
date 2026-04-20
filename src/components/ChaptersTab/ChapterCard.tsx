'use client'

import { mockChapters } from '@/lib/mock-data'
import { AlertTriangle, ChevronDown, Info, Upload } from 'lucide-react'

type Chapter = typeof mockChapters[0]

interface Props {
  chapter: Chapter
  isExpanded: boolean
  onToggle: () => void
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

function formatNumber(n: number) {
  return n.toLocaleString('en-US')
}

function StatusBadge({ chapter }: { chapter: Chapter }) {
  if (!chapter.processed) {
    return (
      <span
        style={{
          backgroundColor: 'hsl(var(--grimm-surface-raised))',
          color: 'hsl(var(--grimm-muted))',
          fontSize: 11,
          padding: '2px 8px',
          borderRadius: 20,
          fontWeight: 500,
        }}
      >
        Unprocessed
      </span>
    )
  }

  const errors = chapter.flags.filter((f) => f.severity === 'error')
  const warnings = chapter.flags.filter((f) => f.severity === 'warning')

  if (errors.length > 0) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          backgroundColor: 'hsl(var(--grimm-danger) / 0.12)',
          color: 'hsl(var(--grimm-danger))',
          fontSize: 11,
          padding: '2px 8px',
          borderRadius: 20,
          fontWeight: 500,
        }}
      >
        <AlertTriangle size={12} />
        {errors.length} {errors.length === 1 ? 'issue' : 'issues'}
      </span>
    )
  }

  if (warnings.length > 0) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          backgroundColor: 'hsl(var(--grimm-accent) / 0.12)',
          color: 'hsl(var(--grimm-accent))',
          fontSize: 11,
          padding: '2px 8px',
          borderRadius: 20,
          fontWeight: 500,
        }}
      >
        <AlertTriangle size={12} />
        {warnings.length} {warnings.length === 1 ? 'warning' : 'warnings'}
      </span>
    )
  }

  return (
    <span
      style={{
        backgroundColor: 'hsl(var(--grimm-success))',
        color: 'hsl(var(--grimm-success-text))',
        fontSize: 11,
        padding: '2px 8px',
        borderRadius: 20,
        fontWeight: 500,
      }}
    >
      Clean
    </span>
  )
}

export function ChapterCard({ chapter, isExpanded, onToggle }: Props) {
  return (
    <div
      style={{
        backgroundColor: 'hsl(var(--grimm-surface))',
        border: '0.5px solid hsl(var(--grimm-border))',
        borderRadius: 10,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => e.key === 'Enter' && onToggle()}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          cursor: 'pointer',
          borderRadius: isExpanded ? '10px 10px 0 0' : 10,
          transition: 'background-color 150ms ease',
        }}
        className="hover:bg-grimm-surface-raised"
      >
        {/* Left group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              backgroundColor: 'hsl(var(--grimm-surface-raised))',
              color: 'hsl(var(--grimm-muted))',
              fontSize: 11,
              fontWeight: 500,
              padding: '3px 8px',
              borderRadius: 4,
              flexShrink: 0,
            }}
          >
            Ch. {String(chapter.number).padStart(2, '0')}
          </span>
          <span
            style={{
              color: 'hsl(var(--grimm-text))',
              fontSize: 15,
              fontFamily: 'var(--font-playfair)',
            }}
          >
            {chapter.title}
          </span>
          {chapter.wordCount > 0 && (
            <span style={{ color: 'hsl(var(--grimm-muted))', fontSize: 12 }}>
              {formatNumber(chapter.wordCount)} words
            </span>
          )}
        </div>

        {/* Right group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <StatusBadge chapter={chapter} />
          <ChevronDown
            size={14}
            style={{
              color: 'hsl(var(--grimm-muted))',
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 200ms ease',
            }}
          />
        </div>
      </div>

      {/* Expandable content */}
      <div
        style={{
          maxHeight: isExpanded ? 1200 : 0,
          overflow: 'hidden',
          transition: 'max-height 250ms ease',
        }}
      >
        <div
          style={{
            opacity: isExpanded ? 1 : 0,
            transform: isExpanded ? 'translateY(0)' : 'translateY(4px)',
            transition: isExpanded ? 'opacity 200ms ease 50ms, transform 200ms ease 50ms' : 'none',
          }}
        >
          {/* Divider */}
          <div style={{ height: '0.5px', backgroundColor: 'hsl(var(--grimm-border))' }} />

          {chapter.processed ? (
            <>
              {/* Summary */}
              <div style={{ padding: '16px 20px' }}>
                <p
                  style={{
                    color: 'hsl(var(--grimm-muted))',
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: 6,
                  }}
                >
                  Summary
                </p>
                <p
                  className="voice-of-world"
                  style={{
                    color: 'hsl(var(--grimm-text))',
                    fontSize: 14,
                    lineHeight: 1.8,
                  }}
                >
                  {chapter.summary}
                </p>
              </div>

              {/* Characters */}
              {chapter.charactersAppearing.length > 0 && (
                <div style={{ padding: '0 20px 16px' }}>
                  <p
                    style={{
                      color: 'hsl(var(--grimm-muted))',
                      fontSize: 11,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    Characters in this chapter
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                    {chapter.charactersAppearing.map((name) => (
                      <span
                        key={name}
                        style={{
                          backgroundColor: 'hsl(var(--grimm-surface-raised))',
                          color: 'hsl(var(--grimm-muted))',
                          fontSize: 12,
                          padding: '4px 10px',
                          borderRadius: 20,
                          border: '0.5px solid hsl(var(--grimm-border))',
                        }}
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Continuity Flags */}
              {chapter.flags.length > 0 && (
                <div style={{ padding: '0 20px 20px' }}>
                  <p
                    style={{
                      color: 'hsl(var(--grimm-muted))',
                      fontSize: 11,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      marginBottom: 10,
                    }}
                  >
                    Continuity flags
                  </p>
                  {chapter.flags.map((flag) => {
                    const isError = flag.severity === 'error'
                    return (
                      <div
                        key={flag.id}
                        style={{
                          backgroundColor: isError
                            ? 'hsl(var(--grimm-danger) / 0.1)'
                            : 'hsl(var(--grimm-accent) / 0.1)',
                          borderLeft: `3px solid hsl(var(--grimm-${isError ? 'danger' : 'accent'}))`,
                          borderRadius: '0 6px 6px 0',
                          padding: '10px 14px',
                          marginBottom: 8,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {isError ? (
                            <AlertTriangle
                              size={12}
                              style={{ color: 'hsl(var(--grimm-danger))', flexShrink: 0 }}
                            />
                          ) : (
                            <Info
                              size={12}
                              style={{ color: 'hsl(var(--grimm-accent))', flexShrink: 0 }}
                            />
                          )}
                          <span
                            style={{
                              color: isError ? 'hsl(var(--grimm-danger))' : 'hsl(var(--grimm-accent))',
                              fontSize: 11,
                              textTransform: 'uppercase',
                              letterSpacing: '0.06em',
                              fontWeight: 500,
                            }}
                          >
                            {isError ? 'Continuity error' : 'Worth checking'}
                          </span>
                        </div>
                        <p
                          style={{
                            color: 'hsl(var(--grimm-text))',
                            fontSize: 13,
                            lineHeight: 1.6,
                            marginTop: 6,
                          }}
                        >
                          {flag.description}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Action row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 20px 16px',
                  borderTop: '0.5px solid hsl(var(--grimm-border))',
                }}
              >
                <span style={{ color: 'hsl(var(--grimm-muted))', fontSize: 12 }}>
                  Uploaded {formatDate(chapter.createdAt)}
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['Re-upload', 'View full text'] as const).map((label) => (
                    <button
                      key={label}
                      onClick={() => console.log(label, chapter.id)}
                      style={{
                        backgroundColor: 'hsl(var(--grimm-surface-raised))',
                        color: 'hsl(var(--grimm-muted))',
                        border: '0.5px solid hsl(var(--grimm-border))',
                        padding: '6px 14px',
                        borderRadius: 6,
                        fontSize: 12,
                        cursor: 'pointer',
                        transition: 'color 150ms ease',
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = 'hsl(var(--grimm-text))')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = 'hsl(var(--grimm-muted))')
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Unprocessed state */
            <div
              style={{
                padding: '24px 20px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Upload size={32} style={{ color: 'hsl(var(--grimm-muted))' }} />
              <p
                style={{
                  color: 'hsl(var(--grimm-text))',
                  fontSize: 14,
                  marginTop: 12,
                }}
              >
                This chapter hasn&apos;t been analyzed yet
              </p>
              <p
                style={{
                  color: 'hsl(var(--grimm-muted))',
                  fontSize: 13,
                  marginTop: 6,
                  maxWidth: 360,
                  lineHeight: 1.5,
                }}
              >
                Upload the text to extract characters, check continuity, and update your world.
              </p>
              <button
                onClick={() => console.log('Analyze now', chapter.id)}
                style={{
                  backgroundColor: 'hsl(var(--grimm-accent))',
                  color: '#1a0e00',
                  padding: '8px 18px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 500,
                  marginTop: 16,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Analyze now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
