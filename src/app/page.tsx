'use client'

import { BookCard } from '@/components/BookCard'
import type { Book } from '@/types'
import { BookOpen, Clock, Home, Library, Plus, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type Tab = 'home' | 'library'

export default function HomePage() {
  const [tab, setTab] = useState<Tab>('home')
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/books')
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`)
        return r.json()
      })
      .then(setBooks)
      .catch(() => setBooks([]))
      .finally(() => setLoading(false))
  }, [])

  function handleDelete(id: string) {
    fetch(`/api/books/${id}`, { method: 'DELETE' }).then(() =>
      setBooks((bs) => bs.filter((b) => b.id !== id))
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 flex flex-col border-r border-border bg-card h-screen sticky top-0">
        {/* Logo */}
        <div className="h-14 flex items-center gap-2 px-4 border-b border-border">
          <Sparkles size={15} className="text-primary" />
          <span className="text-foreground text-xl" style={{ fontFamily: 'Lumos' }}>Grimoire</span>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 p-2 flex-1">
          <button
            onClick={() => setTab('home')}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors w-full text-left ${
              tab === 'home'
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Home size={15} />
            Home
          </button>

          <button
            onClick={() => setTab('library')}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors w-full text-left ${
              tab === 'library'
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Library size={15} />
            Library
          </button>
        </nav>

        {/* New Book */}
        <div className="p-3 border-t border-border">
          <Link
            href="/books/new"
            className="flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus size={14} />
            New Book
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto h-screen">
        {tab === 'home' && <HomeTab books={books} loading={loading} />}
        {tab === 'library' && <LibraryTab books={books} loading={loading} onDelete={handleDelete} />}
      </main>
    </div>
  )
}

// ── Home tab ──────────────────────────────────────────────────────────────────

function HomeTab({ books, loading }: { books: Book[]; loading: boolean }) {
  const recent = books.slice(0, 3)

  return (
    <div className="h-full flex flex-col">
      <div className="max-w-3xl px-8 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: 'Lumos' }}>
            Welcome back.
          </h1>
          <p className="text-muted-foreground mt-2">
            Pick up where you left off, or start something new.
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground px-8">Loading...</p>
      ) : books.length === 0 ? (
        <div className="flex-1 flex items-center justify-center pb-32">
          <EmptyState />
        </div>
      ) : (
        <div className="max-w-3xl px-8">
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Clock size={13} className="text-muted-foreground" />
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Recently updated
            </h2>
          </div>
          <div className="flex flex-col gap-2">
            {recent.map((book) => (
              <RecentBookRow key={book.id} book={book} />
            ))}
          </div>
          {books.length > 3 && (
            <button
              className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              + {books.length - 3} more in Library
            </button>
          )}
        </section>
        </div>
      )}
    </div>
  )
}

function RecentBookRow({ book }: { book: Book }) {
  return (
    <Link
      href={`/books/${book.id}`}
      className="flex items-center gap-4 p-3 rounded-lg border border-border bg-card hover:border-primary/30 hover:bg-primary/5 transition-all group"
    >
      <div className="w-8 h-10 rounded bg-muted flex items-center justify-center shrink-0">
        <BookOpen size={14} className="text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
          {book.title}
        </p>
        <p className="text-xs text-muted-foreground">{book.genre}</p>
      </div>
      {book.word_count > 0 && (
        <span className="text-xs text-muted-foreground shrink-0">
          {book.word_count.toLocaleString()} words
        </span>
      )}
    </Link>
  )
}

// ── Library tab ───────────────────────────────────────────────────────────────

function LibraryTab({
  books,
  loading,
  onDelete,
}: {
  books: Book[]
  loading: boolean
  onDelete: (id: string) => void
}) {
  return (
    <div className="px-8 py-12">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Library</h1>
          {!loading && (
            <p className="text-muted-foreground text-sm mt-1">
              {books.length} {books.length === 1 ? 'book' : 'books'}
            </p>
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : books.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {books.map((book) => (
            <BookCard key={book.id} book={book} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <BookOpen size={20} className="text-muted-foreground" />
      </div>
      <h2 className="text-base font-semibold mb-1">No books yet</h2>
      <p className="text-muted-foreground text-sm max-w-xs mb-5">
        Start a new book and Grimoire will help you build its world, track characters, and keep everything consistent.
      </p>
      <Link
        href="/books/new"
        className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        <Plus size={14} />
        Start a Book
      </Link>
    </div>
  )
}
