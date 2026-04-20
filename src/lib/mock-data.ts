import type { WorldMessageData } from '@/components/WorldMessage'
import type { LoreEntry } from '@/components/LoreSlideOver'

export const MOCK_BOOK_ID = 'mock-book-1'

export const mockBook = {
  id: MOCK_BOOK_ID,
  title: 'The Shattered Crown',
  genre: 'Dark Fantasy',
  logline:
    'The kingdom of Valdris teeters on collapse as magic fades and the Threadweavers tighten their grip on the throne.',
}

// ── Lore sidebar data ─────────────────────────────────────────────────────────

export const mockLoreSections: {
  characters: LoreEntry[]
  factions: LoreEntry[]
  locations: LoreEntry[]
  magic: LoreEntry[]
  misc: LoreEntry[]
} = {
  characters: [],
  factions: [
    {
      id: 'lore-1',
      category: 'faction',
      name: 'The Threadweavers',
      summary: 'A secret society embedded in the imperial court that can manipulate fate itself.',
      data: JSON.stringify({
        founded: 'Unknown — predates the current dynasty',
        power: 'Fate manipulation, imperial intelligence network',
        allegiance: 'The Queen, privately',
        publicFace: 'Do not officially exist',
        weakness: 'Each working of fate requires physical sacrifice',
      }),
    },
    {
      id: 'lore-2',
      category: 'faction',
      name: "The Merchant's Consortium",
      summary: 'Controls all northern trade routes. Currently neutral but economically vulnerable.',
      data: JSON.stringify({
        headquarters: 'Port Ashenveil, northern coast',
        power: 'Monopoly on northern shipping lanes',
        currentStatus: 'Struggling after early winter storms disrupted primary routes',
        leader: 'Guildmaster Renara Voss',
      }),
    },
  ],
  locations: [
    {
      id: 'lore-3',
      category: 'location',
      name: 'Valdris',
      summary: 'The imperial capital and seat of the throne.',
      data: JSON.stringify({
        population: 'Approximately 400,000',
        notableFeatures: 'The Spire, the imperial palace, the Scholar\'s Quarter',
        currentStatus: 'Tense — garrison doubled by royal decree last month',
        atmosphere: 'Paranoid, watchful, outwardly calm',
      }),
    },
    {
      id: 'lore-4',
      category: 'location',
      name: 'The Eastern Provinces',
      summary: 'Technically loyal to the empire but practically autonomous. Where Kael is hiding.',
      data: JSON.stringify({
        governor: 'Lord Therin Mast, a pragmatist',
        relationship: 'Pays tribute but resists imperial overreach',
        currentStatus: "Unaware of Kael's presence officially",
      }),
    },
  ],
  magic: [
    {
      id: 'lore-7',
      category: 'magic',
      name: 'Fate Manipulation',
      summary: "The Threadweavers' core ability. Requires physical sacrifice proportional to the scale of change.",
      data: JSON.stringify({
        cost: 'Minor changes — a bruise. Major changes — years of life. World-altering — death.',
        limitations: 'Cannot change what has already been witnessed by many',
        practitioners: 'Only confirmed among the Threadweavers',
      }),
    },
  ],
  misc: [
    {
      id: 'lore-5',
      category: 'misc',
      name: 'The Dying of Magic',
      summary:
        'Magic requires physical sacrifice — the more powerful the working, the greater the cost. It has been weakening for a generation.',
      data: JSON.stringify({
        cause: 'Unknown publicly. The Threadweavers know the truth.',
        symptoms: 'Spells failing mid-cast, scholars going mad, magical artifacts going dark',
        timeline: 'Began approximately 30 years ago, accelerating recently',
      }),
    },
    {
      id: 'lore-6',
      category: 'misc',
      name: 'The Ashwall Gate',
      summary: 'A gate at the northern border destroyed in the war of 412. Never rebuilt.',
      data: JSON.stringify({
        destroyed: 'Year 412, siege of the northern clans',
        significance: 'Its ruins mark the northernmost point of imperial territory',
        currentStatus: 'Rubble. Considered cursed by locals.',
      }),
    },
  ],
}

// ── Chat messages ─────────────────────────────────────────────────────────────

export const mockMessages: WorldMessageData[] = [
  {
    id: 'msg-1',
    role: 'assistant',
    content:
      "The Shattered Crown awaits its chronicler. An empire frays at its edges while a throne built on secrets grows heavier by the day — and somewhere in the eastern dust, a disgraced general carries knowledge that could unravel everything. Where would you like to begin?",
    metadata: '{}',
    created_at: new Date('2024-01-15T09:00:00').getTime(),
    ripple_cards: [],
  },
  {
    id: 'msg-2',
    role: 'user',
    content:
      "The queen orders the Threadweavers to locate Kael before he reaches the Scholar's Quarter in Valdris.",
    metadata: '{}',
    created_at: new Date('2024-01-15T09:01:00').getTime(),
    ripple_cards: [],
  },
  {
    id: 'msg-3',
    role: 'assistant',
    content:
      "The order ripples through the Threadweavers' invisible network like a stone dropped in still water — quiet on the surface, violent beneath. Kael has been a ghost for three months, but the Queen does not issue such commands without reason. Whatever he took from that courier, she wants it back before it finds scholarly eyes.",
    metadata: '{}',
    created_at: new Date('2024-01-15T09:01:30').getTime(),
    ripple_cards: [
      {
        id: 'ripple-1',
        title: "Consortium Intelligence Risk",
        description:
          "The Merchant's Consortium has informants in the Scholar's Quarter — if the Threadweavers move openly, Guildmaster Renara Voss will know the empire is hunting someone important, which gives her unexpected leverage.",
        status: 'pending',
      },
      {
        id: 'ripple-2',
        title: 'Provincial Suspicion',
        description:
          'The eastern garrison doubling now makes sense to provincial lords as preparation for a manhunt rather than external threat — Lord Therin Mast may begin asking uncomfortable questions.',
        status: 'pending',
      },
    ],
  },
  {
    id: 'msg-4',
    role: 'user',
    content: "Kael arrives at the Ashwall Gate and passes through its intact archway.",
    metadata: '{}',
    created_at: new Date('2024-01-15T09:05:00').getTime(),
    ripple_cards: [],
  },
  {
    id: 'msg-5',
    role: 'assistant',
    content:
      "The Ashwall Gate was destroyed in the war of 412 and has never been rebuilt — its ruins mark the northernmost point of imperial territory and are considered cursed by locals. This contradicts established lore.",
    metadata: JSON.stringify({
      contradictions: [
        {
          description:
            "The Ashwall Gate was established as destroyed rubble in the war of 412 and never rebuilt. This input has Kael passing through its intact archway.",
          existing: "Ashwall Gate — Rubble. Destroyed in Year 412, siege of the northern clans. Never rebuilt.",
          resolution_options: [
            "Override: retcon the gate as partially rebuilt",
            "Override: it was a different gate Kael passed through",
            "Cancel and revise the narration",
          ],
        },
      ],
    }),
    created_at: new Date('2024-01-15T09:05:10').getTime(),
    ripple_cards: [],
  },
  {
    id: 'msg-6',
    role: 'user',
    content: "What would the Merchant's Consortium do if the northern war escalates?",
    metadata: '{}',
    created_at: new Date('2024-01-15T09:08:00').getTime(),
    ripple_cards: [],
  },
  {
    id: 'msg-7',
    role: 'assistant',
    content:
      "The Consortium would fracture before it would fight. Guildmaster Renara Voss has built her power on neutrality — the moment the empire demands sides, half her member houses would break for whoever promised to reopen the northern lanes fastest. If pressed, she would sell intelligence to both sides and call it pragmatism.",
    metadata: '{}',
    created_at: new Date('2024-01-15T09:08:20').getTime(),
    ripple_cards: [],
  },
]
