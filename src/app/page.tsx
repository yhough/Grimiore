export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">Grimoire</h1>
            <p className="text-muted-foreground mt-1 text-sm">Your worlds await</p>
          </div>
          <button className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            New World
          </button>
        </header>

        {/* World cards grid — populated once WorldCard + API are built */}
        <div className="text-center py-24 text-muted-foreground">
          <p className="text-lg">No worlds yet.</p>
          <p className="text-sm mt-1">Create your first world to begin.</p>
        </div>
      </div>
    </main>
  )
}
