'use client'

import { TriangleAlert } from 'lucide-react'

interface Contradiction {
  description: string
  existing: string
  resolution_options: string[]
}

interface Props {
  contradiction: Contradiction
  onOverride: () => void
  onCancel: () => void
}

export function ContradictionAlert({ contradiction, onOverride, onCancel }: Props) {
  return (
    <div className="w-full rounded-lg border border-red-400/40 bg-red-50/80 p-4 flex flex-col gap-3">
      <div className="flex items-start gap-2.5">
        <TriangleAlert size={16} className="text-red-600 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-red-800">Contradiction detected</p>
          <p className="text-sm text-red-700 leading-relaxed">{contradiction.description}</p>
          {contradiction.existing && (
            <p className="text-xs text-red-600/80 mt-1 italic">
              Established: {contradiction.existing}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-2 pl-6">
        <button
          onClick={onOverride}
          className="text-xs font-medium px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
        >
          Override and log anyway
        </button>
        <button
          onClick={onCancel}
          className="text-xs font-medium px-3 py-1.5 rounded border border-red-300 text-red-700 hover:bg-red-100 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
