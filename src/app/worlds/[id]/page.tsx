interface Props {
  params: { id: string }
}

export default function WorldPage({ params }: Props) {
  return (
    <div className="h-screen flex">
      {/* Lore panel — built next */}
      <aside className="w-72 border-r border-border shrink-0 p-4">
        <p className="text-muted-foreground text-sm">Lore panel — coming soon</p>
      </aside>

      {/* Chat panel — built next */}
      <main className="flex-1 flex flex-col">
        <header className="border-b border-border px-6 py-4">
          <p className="text-muted-foreground text-sm font-mono">world/{params.id}</p>
        </header>
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
          Chat interface — coming soon
        </div>
      </main>
    </div>
  )
}
