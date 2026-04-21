'use client'

import { GENRES } from '@/lib/utils'
import { Camera, Trash2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const GENRE_GRADIENTS: Record<string, string> = {
  Fantasy:              'from-violet-950 via-purple-900 to-indigo-950',
  'Science Fiction':    'from-blue-950 via-cyan-900 to-slate-950',
  'Literary Fiction':   'from-stone-800 via-neutral-800 to-zinc-900',
  Thriller:             'from-slate-800 via-zinc-900 to-neutral-950',
  Romance:              'from-rose-950 via-pink-900 to-fuchsia-950',
  Horror:               'from-red-950 via-rose-950 to-zinc-950',
  'Historical Fiction': 'from-amber-950 via-yellow-900 to-stone-950',
  Mystery:              'from-indigo-950 via-slate-900 to-zinc-950',
  'Contemporary Fiction':'from-emerald-950 via-teal-900 to-cyan-950',
  Screenplay:           'from-zinc-700 via-zinc-800 to-zinc-950',
  Other:                'from-zinc-800 via-zinc-900 to-zinc-950',
}

interface BookDetails {
  title: string
  genre: string
  premise: string | null
  cover_image?: string | null
  logline?: string | null
}

interface Props {
  open: boolean
  bookId: string
  initial: BookDetails | null
  onClose: () => void
  onSaved: (updated: BookDetails) => void
}

const inputCls =
  'px-3 py-2 rounded-md border border-input bg-card text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring text-sm w-full transition-colors'

export function BookDetailsSlideOver({ open, bookId, initial, onClose, onSaved }: Props) {
  const [title, setTitle]         = useState('')
  const [genre, setGenre]         = useState('Fantasy')
  const [premise, setPremise]     = useState('')
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')

  const [coverImage, setCoverImage]     = useState<string | null>(null)
  const [coverVersion, setCoverVersion] = useState(Date.now())
  const [uploading, setUploading]       = useState(false)
  const [coverError, setCoverError]     = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open && initial) {
      setTitle(initial.title)
      setGenre(initial.genre)
      setPremise(initial.premise ?? '')
      setCoverImage(initial.cover_image ?? null)
      setError('')
      setCoverError('')
    }
  }, [open, initial])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setUploading(true)
    setCoverError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch(`/api/books/${bookId}/cover`, { method: 'POST', body: fd })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Upload failed')
      }
      const { cover_image } = await res.json()
      setCoverImage(cover_image)
      setCoverVersion(Date.now())
    } catch (err) {
      setCoverError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function handleRemoveCover() {
    await fetch(`/api/books/${bookId}/cover`, { method: 'DELETE' })
    setCoverImage(null)
  }

  async function handleSave() {
    if (!title.trim()) { setError('Title is required.'); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/books/${bookId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), genre, premise: premise.trim() || null }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? 'Something went wrong.')
        return
      }
      onSaved({ title: title.trim(), genre, premise: premise.trim() || null, cover_image: coverImage })
      onClose()
    } catch {
      setError('Network error — please try again.')
    } finally {
      setSaving(false)
    }
  }

  const gradient = GENRE_GRADIENTS[genre] ?? GENRE_GRADIENTS.Other

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]" onClick={onClose} />

      <div className="fixed right-0 top-0 h-full w-[420px] z-50 flex flex-col bg-background border-l border-border shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <h2 className="text-base font-semibold">Book Details</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <X size={15} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">

          {/* Cover */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Cover</label>
            <div className={`relative h-44 rounded-lg overflow-hidden flex items-center justify-center ${coverImage ? 'bg-zinc-900' : `bg-gradient-to-br ${gradient}`}`}>
              {coverImage ? (
                <img
                  src={`${coverImage}?v=${coverVersion}`}
                  alt="Cover"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <p className="text-xs text-white/30 select-none">No cover</p>
              )}

              {/* Upload button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-black/60 hover:bg-black/80 text-white text-xs font-medium transition-colors disabled:opacity-50"
              >
                <Camera size={12} />
                {uploading ? 'Uploading…' : coverImage ? 'Change' : 'Upload cover'}
              </button>

              {/* Remove button */}
              {coverImage && !uploading && (
                <button
                  onClick={handleRemoveCover}
                  className="absolute bottom-2 right-2 p-1.5 rounded-md bg-black/60 hover:bg-black/80 text-white transition-colors"
                  title="Remove cover"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
            {coverError && <p className="text-xs text-destructive">{coverError}</p>}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleCoverChange}
            />
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setError('') }}
              autoFocus
              className={inputCls}
            />
          </div>

          {/* Genre */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Genre</label>
            <select value={genre} onChange={(e) => setGenre(e.target.value)} className={inputCls + ' cursor-pointer'}>
              {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          {/* Premise */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Premise</label>
            <textarea
              value={premise}
              onChange={(e) => setPremise(e.target.value)}
              placeholder="What is this story about?"
              rows={4}
              className={inputCls + ' resize-none'}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border shrink-0 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 rounded text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="px-4 py-1.5 rounded text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </>
  )
}
