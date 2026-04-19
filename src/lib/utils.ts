import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { nanoid } from 'nanoid'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return nanoid()
}

export function formatDate(date: Date | number | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d instanceof Date ? d : new Date(d))
}

export function formatRelativeDate(date: Date | number | string): string {
  const d = new Date(typeof date === 'string' ? date : date instanceof Date ? date.getTime() : date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60_000)
  const diffHours = Math.floor(diffMs / 3_600_000)
  const diffDays = Math.floor(diffMs / 86_400_000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(d)
}

export function parseLoreData<T>(json: string): T {
  try {
    return JSON.parse(json) as T
  } catch {
    return {} as T
  }
}

export function parseMetadata<T>(json: string): T {
  try {
    return JSON.parse(json) as T
  } catch {
    return {} as T
  }
}

export const GENRES = [
  'Fantasy',
  'Science Fiction',
  'Historical Fiction',
  'Horror',
  'Contemporary',
  'Mythology',
  'Steampunk',
  'Post-Apocalyptic',
  'Thriller',
  'Other',
] as const

export type Genre = (typeof GENRES)[number]

export const LORE_TYPE_LABELS: Record<string, string> = {
  character: 'Characters',
  faction: 'Factions',
  location: 'Locations',
  history: 'History',
  misc: 'Lore & Misc',
}
