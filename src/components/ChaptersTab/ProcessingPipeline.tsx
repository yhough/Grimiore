'use client'

import { mockProcessingSteps } from '@/lib/mock-data'
import { Check } from 'lucide-react'

type Step = typeof mockProcessingSteps[0]

interface Props {
  steps: typeof mockProcessingSteps
  chapterTitle: string
}

function StepIcon({ status }: { status: Step['status'] }) {
  if (status === 'complete') {
    return (
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          backgroundColor: 'hsl(var(--grimm-success-text))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Check size={11} color="white" strokeWidth={3} />
      </div>
    )
  }

  if (status === 'active') {
    return (
      <div style={{ width: 20, height: 20, flexShrink: 0 }}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          className="animate-spin"
          style={{ color: 'hsl(var(--grimm-accent))' }}
        >
          <circle
            cx="10"
            cy="10"
            r="7"
            fill="none"
            stroke="hsl(var(--grimm-border))"
            strokeWidth="2"
          />
          <circle
            cx="10"
            cy="10"
            r="7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="12 32"
            strokeLinecap="round"
            strokeDashoffset="0"
          />
        </svg>
      </div>
    )
  }

  return (
    <div
      style={{
        width: 20,
        height: 20,
        borderRadius: '50%',
        border: '0.5px solid hsl(var(--grimm-border))',
        flexShrink: 0,
      }}
    />
  )
}

export function ProcessingPipeline({ steps, chapterTitle }: Props) {
  const activeIndex = steps.findIndex((s) => s.status === 'active')
  const completeCount = steps.filter((s) => s.status === 'complete').length
  const stepLabel =
    activeIndex >= 0
      ? `Step ${activeIndex + 1} of ${steps.length}`
      : `${completeCount} of ${steps.length} complete`

  return (
    <div
      style={{
        backgroundColor: 'hsl(var(--grimm-surface))',
        border: '0.5px solid hsl(var(--grimm-accent) / 0.3)',
        borderRadius: 12,
        padding: '20px 24px',
        marginBottom: 24,
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            className="grimm-pulse-dot"
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: 'hsl(var(--grimm-accent))',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              color: 'hsl(var(--grimm-text))',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Analyzing — {chapterTitle}
          </span>
        </div>
        <span style={{ color: 'hsl(var(--grimm-muted))', fontSize: 13 }}>{stepLabel}</span>
      </div>

      {/* Steps list */}
      <div style={{ marginTop: 16 }}>
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1
          const isActive = step.status === 'active'
          const isComplete = step.status === 'complete'
          const isPending = step.status === 'pending'

          return (
            <div
              key={step.id}
              style={{ display: 'flex', gap: 12, opacity: isPending ? 0.5 : isComplete ? 0.7 : 1 }}
            >
              {/* Left: icon + connector */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <StepIcon status={step.status} />
                {!isLast && (
                  <div
                    style={{
                      flex: 1,
                      minHeight: 12,
                      width: 1,
                      backgroundColor: 'hsl(var(--grimm-border))',
                      marginTop: 3,
                      marginBottom: 3,
                    }}
                  />
                )}
              </div>

              {/* Center + right content */}
              <div
                className={isActive ? 'grimm-processing-bg' : ''}
                style={{
                  flex: 1,
                  paddingBottom: isLast ? 0 : 12,
                  ...(isActive
                    ? {
                        backgroundColor: 'hsl(var(--grimm-accent) / 0.08)',
                        borderRadius: 6,
                        padding: '8px 12px',
                        margin: '-8px -12px',
                        marginBottom: isLast ? -8 : 4,
                      }
                    : {}),
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <div>
                    <p
                      style={{
                        color: isComplete || isActive ? 'hsl(var(--grimm-text))' : 'hsl(var(--grimm-muted))',
                        fontSize: 13,
                        fontWeight: 500,
                        lineHeight: 1.4,
                        margin: 0,
                      }}
                    >
                      {step.label}
                    </p>
                    <p
                      style={{
                        color: 'hsl(var(--grimm-muted))',
                        fontSize: 12,
                        marginTop: 2,
                        opacity: isPending ? 0.6 : 1,
                        margin: '2px 0 0 0',
                      }}
                    >
                      {step.description}
                    </p>
                  </div>
                  {isActive && (
                    <span
                      style={{
                        color: 'hsl(var(--grimm-accent))',
                        fontSize: 12,
                        fontStyle: 'italic',
                        flexShrink: 0,
                        paddingTop: 1,
                      }}
                    >
                      In progress...
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
