export type LoreType = 'character' | 'faction' | 'location' | 'history' | 'misc'
export type RippleStatus = 'pending' | 'accepted' | 'dismissed'
export type MessageRole = 'user' | 'assistant'

export interface World {
  id: string
  name: string
  genre: string
  premise: string | null
  description: string | null
  createdAt: Date
  updatedAt: Date
}

export interface LoreEntry {
  id: string
  worldId: string
  type: LoreType
  name: string
  summary: string | null
  data: string // raw JSON
  createdAt: Date
  updatedAt: Date
}

export interface ChatMessage {
  id: string
  worldId: string
  role: MessageRole
  content: string
  metadata: string // raw JSON
  createdAt: Date
}

export interface RippleCard {
  id: string
  messageId: string
  worldId: string
  title: string
  description: string
  status: RippleStatus
  createdAt: Date
}

// ── Typed lore data shapes ────────────────────────────────────────────────────

export interface CharacterData {
  traits: string[]
  allegiances: string[]
  status: 'alive' | 'dead' | 'unknown'
  notes: string
}

export interface FactionData {
  power_level: string
  territory: string
  allies: string[]
  enemies: string[]
  notes: string
}

export interface LocationData {
  region: string
  notable_facts: string[]
  connected_factions: string[]
  notes: string
}

export interface HistoryData {
  world_date?: string
  summary: string
  participants: string[]
  impact: string
}

export interface MiscData {
  category: string
  notes: string
}

// ── AI response schema ────────────────────────────────────────────────────────

export interface LoreUpdate {
  type: LoreType
  name: string
  action: 'create' | 'update'
  summary: string
  data: Record<string, unknown>
}

export interface Contradiction {
  description: string
  existing_lore: string
  resolution_options: string[]
}

export interface RippleEffect {
  title: string
  description: string
}

export interface ClaudeWorldResponse {
  response: string
  lore_updates: LoreUpdate[]
  ripple_effects: RippleEffect[]
  contradictions: Contradiction[]
  is_question: boolean
}

export interface ChatMetadata {
  lore_updates?: LoreUpdate[]
  contradictions?: Contradiction[]
  is_question?: boolean
}
