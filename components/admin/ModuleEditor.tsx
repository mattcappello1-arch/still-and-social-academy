'use client'

import { useState, useRef, useCallback } from 'react'

/* ────────────────────────────────────────────
   Types
   ──────────────────────────────────────────── */

type BlockType =
  | 'text' | 'heading' | 'image' | 'video' | 'welcome_video' | 'tip' | 'quote'
  | 'steps' | 'checklist' | 'divider' | 'callout' | 'accordion'
  | 'scenario' | 'flipcards' | 'hotspot' | 'timeline'
  | 'matching' | 'reveal' | 'highlight' | 'comparison'

interface BlockData {
  // Existing
  html?: string
  text?: string
  level?: 2 | 3 | 4
  url?: string
  alt?: string
  caption?: string
  fullWidth?: boolean
  provider?: 'youtube' | 'vimeo' | 'direct'
  title?: string
  items?: unknown[]
  type?: 'info' | 'warning' | 'success'
  attribution?: string
  // Scenario
  situation?: string
  options?: { text: string; correct: boolean; feedback: string }[]
  // Hotspot
  imageUrl?: string
  spots?: { x: number; y: number; label: string; description: string }[]
  // Matching
  instruction?: string
  pairs?: { left: string; right: string }[]
  // Reveal
  sections?: { title: string; content: string }[]
  // Highlight
  definitions?: Record<string, string>
  // Comparison
  before?: { label: string; text: string }
  after?: { label: string; text: string }
  // Welcome video
  subtitle?: string
}

interface Block {
  type: BlockType
  data: BlockData
}

/* ────────────────────────────────────────────
   Block palette config
   ──────────────────────────────────────────── */

const BLOCK_TYPES: { type: BlockType; label: string; icon: string; desc: string; category: 'content' | 'interactive' }[] = [
  // Content blocks
  { type: 'text', label: 'Text', icon: 'T', desc: 'Rich text paragraph', category: 'content' },
  { type: 'heading', label: 'Heading', icon: 'H', desc: 'Section heading', category: 'content' },
  { type: 'image', label: 'Image', icon: '\u{1f5bc}', desc: 'Image with caption', category: 'content' },
  { type: 'video', label: 'Video', icon: '\u25b6', desc: 'YouTube/Vimeo/direct', category: 'content' },
  { type: 'welcome_video', label: 'Welcome Video', icon: '\u25b6\u25b6', desc: 'Full-width hero video', category: 'content' },
  { type: 'tip', label: 'Tip', icon: '\u{1f4a1}', desc: 'Highlighted tip', category: 'content' },
  { type: 'quote', label: 'Quote', icon: '\u275d', desc: 'Styled pullquote', category: 'content' },
  { type: 'steps', label: 'Steps', icon: '\u2460', desc: 'Step-by-step guide', category: 'content' },
  { type: 'checklist', label: 'Checklist', icon: '\u2611', desc: 'Interactive checklist', category: 'content' },
  { type: 'divider', label: 'Divider', icon: '\u00b7\u00b7\u00b7', desc: 'Visual separator', category: 'content' },
  { type: 'callout', label: 'Callout', icon: '!', desc: 'Important info box', category: 'content' },
  { type: 'accordion', label: 'Accordion', icon: '\u25b8', desc: 'Expandable FAQ', category: 'content' },
  // Interactive blocks
  { type: 'scenario', label: 'Scenario', icon: '?', desc: 'What would you do?', category: 'interactive' },
  { type: 'flipcards', label: 'Flip Cards', icon: '\u21bb', desc: 'Click to reveal cards', category: 'interactive' },
  { type: 'hotspot', label: 'Hotspot', icon: '\u25c9', desc: 'Image with info dots', category: 'interactive' },
  { type: 'timeline', label: 'Timeline', icon: '\u23f0', desc: 'Sequential process', category: 'interactive' },
  { type: 'matching', label: 'Matching', icon: '\u2194', desc: 'Pair matching exercise', category: 'interactive' },
  { type: 'reveal', label: 'Reveal', icon: '\u25bc', desc: 'Progressive content', category: 'interactive' },
  { type: 'highlight', label: 'Highlight', icon: '\u270e', desc: 'Terms with definitions', category: 'interactive' },
  { type: 'comparison', label: 'Compare', icon: '\u2b0c', desc: 'Before vs after', category: 'interactive' },
]

function createEmptyBlock(type: BlockType): Block {
  switch (type) {
    case 'text': return { type, data: { html: '' } }
    case 'heading': return { type, data: { text: '', level: 3 } }
    case 'image': return { type, data: { url: '', alt: '', caption: '' } }
    case 'video': return { type, data: { url: '' } }
    case 'welcome_video': return { type, data: { url: '', title: '', subtitle: '' } }
    case 'tip': return { type, data: { text: '', title: '' } }
    case 'quote': return { type, data: { text: '', attribution: '' } }
    case 'steps': return { type, data: { items: [{ title: '', description: '' }] } }
    case 'checklist': return { type, data: { items: [''] } }
    case 'divider': return { type, data: {} }
    case 'callout': return { type, data: { text: '', type: 'info' } }
    case 'accordion': return { type, data: { items: [{ title: '', content: '' }] } }
    case 'scenario': return { type, data: { situation: '', options: [{ text: '', correct: true, feedback: '' }, { text: '', correct: false, feedback: '' }] } }
    case 'flipcards': return { type, data: { items: [{ front: '', back: '' }] } }
    case 'hotspot': return { type, data: { imageUrl: '', spots: [{ x: 50, y: 50, label: '', description: '' }] } }
    case 'timeline': return { type, data: { items: [{ time: '', title: '', description: '' }] } }
    case 'matching': return { type, data: { instruction: '', pairs: [{ left: '', right: '' }] } }
    case 'reveal': return { type, data: { sections: [{ title: '', content: '' }] } }
    case 'highlight': return { type, data: { text: '', definitions: {} } }
    case 'comparison': return { type, data: { before: { label: 'Instead of this', text: '' }, after: { label: 'Try this', text: '' } } }
  }
}

/* ────────────────────────────────────────────
   Main editor component
   ──────────────────────────────────────────── */

export function ModuleEditor({
  initialBlocks,
  moduleId,
  pathId,
  title: initialTitle,
  description: initialDescription,
  estimatedMinutes: initialMinutes,
  readAloudEnabled,
  audioIntroUrl,
  saveAction,
}: {
  initialBlocks: Block[]
  moduleId: string
  pathId: string
  title: string
  description: string
  estimatedMinutes: number
  readAloudEnabled?: boolean
  audioIntroUrl?: string
  saveAction: (moduleId: string, data: { title: string; description: string; estimatedMinutes: number; blocks: unknown[]; readAloudEnabled: boolean; audioIntroUrl: string }) => Promise<{ error?: string }>
}) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks.length > 0 ? initialBlocks : [])
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription)
  const [estimatedMinutes, setEstimatedMinutes] = useState(initialMinutes)
  const [readAloud, setReadAloud] = useState(readAloudEnabled ?? true)
  const [audioIntro, setAudioIntro] = useState(audioIntroUrl ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(true)
  const [preview, setPreview] = useState(false)
  const [addMenuIndex, setAddMenuIndex] = useState<number | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const addMenuRef = useRef<HTMLDivElement>(null)

  const markUnsaved = useCallback(() => setSaved(false), [])

  const updateBlock = useCallback((index: number, data: BlockData) => {
    setBlocks(prev => {
      const next = [...prev]
      next[index] = { ...next[index], data: { ...next[index].data, ...data } }
      return next
    })
    markUnsaved()
  }, [markUnsaved])

  const addBlock = useCallback((type: BlockType, atIndex?: number) => {
    const newBlock = createEmptyBlock(type)
    setBlocks(prev => {
      const next = [...prev]
      const insertAt = atIndex !== undefined ? atIndex : next.length
      next.splice(insertAt, 0, newBlock)
      return next
    })
    setAddMenuIndex(null)
    markUnsaved()
  }, [markUnsaved])

  const deleteBlock = useCallback((index: number) => {
    setBlocks(prev => prev.filter((_, i) => i !== index))
    markUnsaved()
  }, [markUnsaved])

  const handleSave = async () => {
    setSaving(true)
    const result = await saveAction(moduleId, {
      title,
      description,
      estimatedMinutes,
      blocks,
      readAloudEnabled: readAloud,
      audioIntroUrl: audioIntro,
    })
    setSaving(false)
    if (!result.error) setSaved(true)
  }

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDragIndex(index)
  }
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }
  const handleDrop = (index: number) => {
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null)
      setDragOverIndex(null)
      return
    }
    setBlocks(prev => {
      const next = [...prev]
      const [moved] = next.splice(dragIndex, 1)
      next.splice(index > dragIndex ? index - 1 : index, 0, moved)
      return next
    })
    setDragIndex(null)
    setDragOverIndex(null)
    markUnsaved()
  }

  return (
    <div className="grid lg:grid-cols-[1fr_300px] gap-8">
      {/* Main editor area */}
      <div>
        {/* Toolbar */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPreview(!preview)}
              className={`rounded-lg px-3 py-1.5 font-mono text-xs transition ${preview ? 'bg-sienna text-cream' : 'bg-white/60 text-ink-soft border border-rule hover:border-sienna/30'}`}
            >
              {preview ? 'Edit Mode' : 'Preview'}
            </button>
            <span className={`font-mono text-[10px] tracking-wide ${saved ? 'text-sage' : 'text-sienna'}`}>
              {saving ? 'Saving...' : saved ? 'All changes saved' : 'Unsaved changes'}
            </span>
          </div>
        </div>

        {preview ? (
          /* Preview mode - render blocks as the viewer would */
          <div className="rounded-xl border border-rule bg-white/60 p-8 space-y-6">
            {blocks.map((block, i) => (
              <PreviewBlock key={i} block={block} />
            ))}
            {blocks.length === 0 && (
              <p className="text-center font-mono text-sm text-ink-soft py-8">No blocks yet. Switch to edit mode to add content.</p>
            )}
          </div>
        ) : (
          /* Edit mode */
          <div className="space-y-2">
            {blocks.map((block, i) => (
              <div key={i}>
                {/* Add-between button */}
                <AddBetweenButton
                  index={i}
                  addMenuIndex={addMenuIndex}
                  setAddMenuIndex={setAddMenuIndex}
                  addBlock={addBlock}
                  addMenuRef={addMenuRef}
                />

                {/* Block card */}
                <div
                  draggable
                  onDragStart={() => handleDragStart(i)}
                  onDragOver={(e) => handleDragOver(e, i)}
                  onDrop={() => handleDrop(i)}
                  onDragEnd={() => { setDragIndex(null); setDragOverIndex(null) }}
                  className={`rounded-xl border bg-white/60 transition ${
                    dragOverIndex === i && dragIndex !== i ? 'border-sienna shadow-sm' : 'border-rule'
                  } ${dragIndex === i ? 'opacity-40' : ''}`}
                >
                  {/* Block header */}
                  <div className="flex items-center justify-between border-b border-rule/50 px-4 py-2">
                    <div className="flex items-center gap-2">
                      <span className="cursor-grab text-ink-soft select-none" title="Drag to reorder">{'\u22ee\u22ee'}</span>
                      <span className="font-mono text-[10px] tracking-[0.2em] text-ink-soft uppercase">{block.type}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { if (confirm('Delete this block?')) deleteBlock(i) }}
                      className="rounded p-1 text-ink-soft transition hover:bg-rosewood/10 hover:text-rosewood"
                      title="Delete block"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                    </button>
                  </div>

                  {/* Block editor */}
                  <div className="p-4">
                    <BlockEditor block={block} index={i} updateBlock={updateBlock} />
                  </div>
                </div>
              </div>
            ))}

            {/* Add block at end */}
            <AddBetweenButton
              index={blocks.length}
              addMenuIndex={addMenuIndex}
              setAddMenuIndex={setAddMenuIndex}
              addBlock={addBlock}
              addMenuRef={addMenuRef}
              isLast
            />
          </div>
        )}
      </div>

      {/* Right sidebar - settings */}
      <div className="space-y-6">
        <div className="rounded-xl border border-rule bg-cream-soft p-5 space-y-4">
          <h3 className="font-mono text-[10px] tracking-[0.2em] text-ink-soft uppercase">Module Settings</h3>

          <div>
            <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-ink-soft mb-1.5">Title</label>
            <input
              value={title}
              onChange={(e) => { setTitle(e.target.value); markUnsaved() }}
              className="w-full bg-white border border-rule rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-olive"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-ink-soft mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => { setDescription(e.target.value); markUnsaved() }}
              rows={3}
              className="w-full bg-white border border-rule rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-olive resize-y"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-ink-soft mb-1.5">Est. Minutes</label>
            <input
              type="number"
              value={estimatedMinutes}
              onChange={(e) => { setEstimatedMinutes(parseInt(e.target.value) || 3); markUnsaved() }}
              min={1}
              className="w-24 bg-white border border-rule rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-olive"
            />
          </div>

          <div className="border-t border-rule pt-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="block font-mono text-[10px] tracking-[0.2em] uppercase text-ink-soft">Read Aloud</span>
                <span className="block font-mono text-[10px] text-ink-soft/70 mt-0.5">Enable text-to-speech player</span>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={readAloud}
                  onChange={(e) => { setReadAloud(e.target.checked); markUnsaved() }}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-oatmeal/50 rounded-full peer peer-checked:bg-sienna transition-colors" />
                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4 shadow-sm" />
              </div>
            </label>
          </div>

          {readAloud && (
            <div>
              <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-ink-soft mb-1.5">Audio Intro URL</label>
              <input
                value={audioIntro}
                onChange={(e) => { setAudioIntro(e.target.value); markUnsaved() }}
                placeholder="Optional audio intro file..."
                className="w-full bg-white border border-rule rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-olive"
              />
              <p className="mt-1 font-mono text-[9px] text-ink-soft/70">Plays before TTS starts</p>
            </div>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-sienna text-cream font-mono text-sm py-2.5 rounded-lg hover:bg-sienna-dk transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Module'}
          </button>
        </div>

        {/* Block palette */}
        <div className="rounded-xl border border-rule bg-cream-soft p-5">
          <h3 className="font-mono text-[10px] tracking-[0.2em] text-ink-soft uppercase mb-3">Content Blocks</h3>
          <div className="grid grid-cols-2 gap-2">
            {BLOCK_TYPES.filter(bt => bt.category === 'content').map((bt) => (
              <button
                key={bt.type}
                type="button"
                onClick={() => addBlock(bt.type)}
                className="flex items-center gap-2 rounded-lg border border-rule bg-white/60 px-3 py-2 text-left transition hover:border-sienna/30 hover:bg-white"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-cream-soft font-mono text-[10px] text-ink-soft">{bt.icon}</span>
                <span className="font-mono text-[11px] text-ink">{bt.label}</span>
              </button>
            ))}
          </div>

          <h3 className="font-mono text-[10px] tracking-[0.2em] text-ink-soft uppercase mt-5 mb-3">Interactive Blocks</h3>
          <div className="grid grid-cols-2 gap-2">
            {BLOCK_TYPES.filter(bt => bt.category === 'interactive').map((bt) => (
              <button
                key={bt.type}
                type="button"
                onClick={() => addBlock(bt.type)}
                className="flex items-center gap-2 rounded-lg border border-sienna/20 bg-sienna/5 px-3 py-2 text-left transition hover:border-sienna/40 hover:bg-sienna/10"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-sienna/10 font-mono text-[10px] text-sienna">{bt.icon}</span>
                <span className="font-mono text-[11px] text-ink">{bt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────
   Add-between button
   ──────────────────────────────────────────── */

function AddBetweenButton({
  index,
  addMenuIndex,
  setAddMenuIndex,
  addBlock,
  addMenuRef,
  isLast,
}: {
  index: number
  addMenuIndex: number | null
  setAddMenuIndex: (i: number | null) => void
  addBlock: (type: BlockType, atIndex: number) => void
  addMenuRef: React.RefObject<HTMLDivElement | null>
  isLast?: boolean
}) {
  const isOpen = addMenuIndex === index

  return (
    <div className={`relative flex items-center justify-center ${isLast ? 'py-4' : 'py-1'}`}>
      <button
        type="button"
        onClick={() => setAddMenuIndex(isOpen ? null : index)}
        className={`flex h-6 w-6 items-center justify-center rounded-full border transition ${
          isOpen ? 'border-sienna bg-sienna text-cream' : 'border-rule text-ink-soft hover:border-sienna/30 hover:text-sienna'
        }`}
        title="Add block"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
      </button>

      {isOpen && (
        <div ref={addMenuRef} className="absolute top-full left-1/2 z-20 mt-1 -translate-x-1/2 rounded-xl border border-rule bg-cream shadow-lg p-3 w-80">
          <p className="font-mono text-[10px] tracking-[0.2em] text-ink-soft uppercase mb-2">Content</p>
          <div className="grid grid-cols-2 gap-1.5">
            {BLOCK_TYPES.filter(bt => bt.category === 'content').map((bt) => (
              <button
                key={bt.type}
                type="button"
                onClick={() => addBlock(bt.type, index)}
                className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-left transition hover:bg-sienna/5"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-cream-soft font-mono text-[10px] text-ink-soft">{bt.icon}</span>
                <div>
                  <span className="block font-mono text-[11px] text-ink leading-tight">{bt.label}</span>
                  <span className="block font-mono text-[9px] text-ink-soft leading-tight">{bt.desc}</span>
                </div>
              </button>
            ))}
          </div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-sienna uppercase mt-3 mb-2">Interactive</p>
          <div className="grid grid-cols-2 gap-1.5">
            {BLOCK_TYPES.filter(bt => bt.category === 'interactive').map((bt) => (
              <button
                key={bt.type}
                type="button"
                onClick={() => addBlock(bt.type, index)}
                className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-left transition hover:bg-sienna/5"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-sienna/10 font-mono text-[10px] text-sienna">{bt.icon}</span>
                <div>
                  <span className="block font-mono text-[11px] text-ink leading-tight">{bt.label}</span>
                  <span className="block font-mono text-[9px] text-ink-soft leading-tight">{bt.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ────────────────────────────────────────────
   Per-block editor forms
   ──────────────────────────────────────────── */

function BlockEditor({
  block,
  index,
  updateBlock,
}: {
  block: Block
  index: number
  updateBlock: (index: number, data: BlockData) => void
}) {
  const update = (data: Partial<BlockData>) => updateBlock(index, data as BlockData)

  switch (block.type) {
    case 'text':
      return (
        <textarea
          value={block.data.html ?? ''}
          onChange={(e) => update({ html: e.target.value })}
          placeholder="Enter HTML content..."
          rows={4}
          className="w-full bg-cream-soft/30 border border-rule rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-olive resize-y"
        />
      )

    case 'heading':
      return (
        <div className="space-y-2">
          <div className="flex gap-2">
            {([2, 3, 4] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => update({ level: lvl })}
                className={`rounded px-2.5 py-1 font-mono text-xs transition ${
                  (block.data.level ?? 3) === lvl ? 'bg-sienna text-cream' : 'bg-white/60 border border-rule text-ink-soft hover:border-sienna/30'
                }`}
              >
                H{lvl}
              </button>
            ))}
          </div>
          <input
            value={block.data.text ?? ''}
            onChange={(e) => update({ text: e.target.value })}
            placeholder="Heading text..."
            className="w-full bg-cream-soft/30 border border-rule rounded-lg px-3 py-2.5 text-sm font-serif focus:outline-none focus:border-olive"
          />
        </div>
      )

    case 'image':
      return (
        <div className="space-y-2">
          <input
            value={block.data.url ?? ''}
            onChange={(e) => update({ url: e.target.value })}
            placeholder="Image URL..."
            className="w-full bg-cream-soft/30 border border-rule rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-olive"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              value={block.data.alt ?? ''}
              onChange={(e) => update({ alt: e.target.value })}
              placeholder="Alt text..."
              className="w-full bg-cream-soft/30 border border-rule rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-olive"
            />
            <input
              value={block.data.caption ?? ''}
              onChange={(e) => update({ caption: e.target.value })}
              placeholder="Caption..."
              className="w-full bg-cream-soft/30 border border-rule rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-olive"
            />
          </div>
          <label className="flex items-center gap-2 font-mono text-xs text-ink-soft">
            <input
              type="checkbox"
              checked={!!block.data.fullWidth}
              onChange={(e) => update({ fullWidth: e.target.checked })}
              className="accent-sienna"
            />
            Full width
          </label>
          {block.data.url && (
            <div className="rounded-lg border border-rule overflow-hidden max-h-32">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={block.data.url} alt="preview" className="w-full h-32 object-cover" />
            </div>
          )}
        </div>
      )

    case 'video':
      return (
        <input
          value={block.data.url ?? ''}
          onChange={(e) => update({ url: e.target.value })}
          placeholder="YouTube, Vimeo or direct video URL..."
          className="w-full bg-cream-soft/30 border border-rule rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-olive"
        />
      )

    case 'welcome_video':
      return (
        <div className="space-y-2">
          <input
            value={block.data.url ?? ''}
            onChange={(e) => update({ url: e.target.value })}
            placeholder="Video URL (YouTube, Vimeo, or direct)..."
            className="w-full bg-cream-soft/30 border border-rule rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-olive"
          />
          <input
            value={block.data.title ?? ''}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="Title overlay..."
            className="w-full bg-cream-soft/30 border border-rule rounded-lg px-3 py-2 text-sm font-serif focus:outline-none focus:border-olive"
          />
          <input
            value={(block.data as any).subtitle ?? ''}
            onChange={(e) => update({ subtitle: e.target.value } as any)}
            placeholder="Subtitle (optional)..."
            className="w-full bg-cream-soft/30 border border-rule rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-olive"
          />
        </div>
      )

    case 'tip':
      return (
        <div className="space-y-2">
          <input
            value={block.data.title ?? ''}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="Tip title (optional)..."
            className="w-full bg-cream-soft/30 border border-rule rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-olive"
          />
          <textarea
            value={block.data.text ?? ''}
            onChange={(e) => update({ text: e.target.value })}
            placeholder="Tip content..."
            rows={3}
            className="w-full bg-cream-soft/30 border border-rule rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-olive resize-y"
          />
        </div>
      )

    case 'quote':
      return (
        <div className="space-y-2">
          <textarea
            value={block.data.text ?? ''}
            onChange={(e) => update({ text: e.target.value })}
            placeholder="Quote text..."
            rows={3}
            className="w-full bg-cream-soft/30 border border-rule rounded-lg px-3 py-2.5 text-sm font-serif italic focus:outline-none focus:border-olive resize-y"
          />
          <input
            value={block.data.attribution ?? ''}
            onChange={(e) => update({ attribution: e.target.value })}
            placeholder="Attribution (optional)..."
            className="w-full bg-cream-soft/30 border border-rule rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-olive"
          />
        </div>
      )

    case 'steps':
      return <StepsEditor block={block} index={index} updateBlock={updateBlock} />

    case 'checklist':
      return <ChecklistEditor block={block} index={index} updateBlock={updateBlock} />

    case 'divider':
      return (
        <div className="flex items-center justify-center py-2 text-oatmeal select-none">
          <span>{'\u00b7 \u00b7 \u00b7'}</span>
        </div>
      )

    case 'callout':
      return (
        <div className="space-y-2">
          <div className="flex gap-2">
            {(['info', 'warning', 'success'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => update({ type: t })}
                className={`rounded px-2.5 py-1 font-mono text-xs capitalize transition ${
                  (block.data.type ?? 'info') === t ? 'bg-sienna text-cream' : 'bg-white/60 border border-rule text-ink-soft hover:border-sienna/30'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <textarea
            value={block.data.text ?? ''}
            onChange={(e) => update({ text: e.target.value })}
            placeholder="Callout content..."
            rows={3}
            className="w-full bg-cream-soft/30 border border-rule rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-olive resize-y"
          />
        </div>
      )

    case 'accordion':
      return <AccordionEditor block={block} index={index} updateBlock={updateBlock} />

    /* ── New interactive block editors ── */

    case 'scenario':
      return <ScenarioEditor block={block} index={index} updateBlock={updateBlock} />

    case 'flipcards':
      return <FlipCardsEditor block={block} index={index} updateBlock={updateBlock} />

    case 'hotspot':
      return <HotspotEditor block={block} index={index} updateBlock={updateBlock} />

    case 'timeline':
      return <TimelineEditor block={block} index={index} updateBlock={updateBlock} />

    case 'matching':
      return <MatchingEditor block={block} index={index} updateBlock={updateBlock} />

    case 'reveal':
      return <RevealEditor block={block} index={index} updateBlock={updateBlock} />

    case 'highlight':
      return <HighlightEditor block={block} index={index} updateBlock={updateBlock} />

    case 'comparison':
      return <ComparisonEditor block={block} index={index} updateBlock={updateBlock} />

    default:
      return <p className="font-mono text-xs text-ink-soft">Unknown block type</p>
  }
}

/* ────────────────────────────────────────────
   Existing editors
   ──────────────────────────────────────────── */

function StepsEditor({ block, index, updateBlock }: { block: Block; index: number; updateBlock: (i: number, d: BlockData) => void }) {
  const items = (block.data.items as { title: string; description: string }[]) ?? []

  const updateItems = (newItems: { title: string; description: string }[]) => {
    updateBlock(index, { items: newItems })
  }

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex gap-3 items-start">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sienna/10 text-sienna font-mono text-xs mt-1">{i + 1}</div>
          <div className="flex-1 space-y-1.5">
            <input
              value={item.title}
              onChange={(e) => {
                const next = [...items]
                next[i] = { ...next[i], title: e.target.value }
                updateItems(next)
              }}
              placeholder="Step title..."
              className="w-full bg-cream-soft/30 border border-rule rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-olive"
            />
            <textarea
              value={item.description}
              onChange={(e) => {
                const next = [...items]
                next[i] = { ...next[i], description: e.target.value }
                updateItems(next)
              }}
              placeholder="Step description..."
              rows={2}
              className="w-full bg-cream-soft/30 border border-rule rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-olive resize-y"
            />
          </div>
          <button
            type="button"
            onClick={() => updateItems(items.filter((_, j) => j !== i))}
            className="mt-1 rounded p-1 text-ink-soft hover:text-rosewood transition"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => updateItems([...items, { title: '', description: '' }])}
        className="font-mono text-xs text-sienna hover:underline"
      >
        + Add step
      </button>
    </div>
  )
}

function ChecklistEditor({ block, index, updateBlock }: { block: Block; index: number; updateBlock: (i: number, d: BlockData) => void }) {
  const items = (block.data.items as string[]) ?? []

  const updateItems = (newItems: string[]) => {
    updateBlock(index, { items: newItems })
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-ink-soft">{'\u2610'}</span>
          <input
            value={item}
            onChange={(e) => {
              const next = [...items]
              next[i] = e.target.value
              updateItems(next)
            }}
            placeholder="Checklist item..."
            className="flex-1 bg-cream-soft/30 border border-rule rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-olive"
          />
          <button
            type="button"
            onClick={() => updateItems(items.filter((_, j) => j !== i))}
            className="rounded p-1 text-ink-soft hover:text-rosewood transition"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => updateItems([...items, ''])}
        className="font-mono text-xs text-sienna hover:underline"
      >
        + Add item
      </button>
    </div>
  )
}

function AccordionEditor({ block, index, updateBlock }: { block: Block; index: number; updateBlock: (i: number, d: BlockData) => void }) {
  const items = (block.data.items as { title: string; content: string }[]) ?? []

  const updateItems = (newItems: { title: string; content: string }[]) => {
    updateBlock(index, { items: newItems })
  }

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-lg border border-rule/50 p-3 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-ink-soft text-xs">{'\u25b8'}</span>
            <input
              value={item.title}
              onChange={(e) => {
                const next = [...items]
                next[i] = { ...next[i], title: e.target.value }
                updateItems(next)
              }}
              placeholder="Accordion title..."
              className="flex-1 bg-cream-soft/30 border border-rule rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-olive"
            />
            <button
              type="button"
              onClick={() => updateItems(items.filter((_, j) => j !== i))}
              className="rounded p-1 text-ink-soft hover:text-rosewood transition"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>
          <textarea
            value={item.content}
            onChange={(e) => {
              const next = [...items]
              next[i] = { ...next[i], content: e.target.value }
              updateItems(next)
            }}
            placeholder="Accordion content..."
            rows={2}
            className="w-full bg-cream-soft/30 border border-rule rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-olive resize-y"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() => updateItems([...items, { title: '', content: '' }])}
        className="font-mono text-xs text-sienna hover:underline"
      >
        + Add item
      </button>
    </div>
  )
}

/* ────────────────────────────────────────────
   New interactive block editors
   ──────────────────────────────────────────── */

function ScenarioEditor({ block, index, updateBlock }: { block: Block; index: number; updateBlock: (i: number, d: BlockData) => void }) {
  const options = (block.data.options as { text: string; correct: boolean; feedback: string }[]) ?? []

  return (
    <div className="space-y-3">
      <textarea
        value={block.data.situation ?? ''}
        onChange={(e) => updateBlock(index, { situation: e.target.value })}
        placeholder="Describe the scenario / situation..."
        rows={3}
        className="w-full bg-cream-soft/30 border border-rule rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-olive resize-y"
      />
      <p className="font-mono text-[10px] tracking-[0.2em] text-ink-soft uppercase">Options</p>
      {options.map((opt, i) => (
        <div key={i} className="rounded-lg border border-rule/50 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 font-mono text-xs text-ink-soft shrink-0">
              <input
                type="radio"
                name={`scenario-correct-${index}`}
                checked={opt.correct}
                onChange={() => {
                  const next = options.map((o, j) => ({ ...o, correct: j === i }))
                  updateBlock(index, { options: next })
                }}
                className="accent-sage"
              />
              Correct
            </label>
            <input
              value={opt.text}
              onChange={(e) => {
                const next = [...options]
                next[i] = { ...next[i], text: e.target.value }
                updateBlock(index, { options: next })
              }}
              placeholder="Option text..."
              className="flex-1 bg-cream-soft/30 border border-rule rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-olive"
            />
            <button
              type="button"
              onClick={() => updateBlock(index, { options: options.filter((_, j) => j !== i) })}
              className="rounded p-1 text-ink-soft hover:text-rosewood transition"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>
          <input
            value={opt.feedback}
            onChange={(e) => {
              const next = [...options]
              next[i] = { ...next[i], feedback: e.target.value }
              updateBlock(index, { options: next })
            }}
            placeholder="Feedback shown after selection..."
            className="w-full bg-cream-soft/30 border border-rule rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-olive"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() => updateBlock(index, { options: [...options, { text: '', correct: false, feedback: '' }] })}
        className="font-mono text-xs text-sienna hover:underline"
      >
        + Add option
      </button>
    </div>
  )
}

function FlipCardsEditor({ block, index, updateBlock }: { block: Block; index: number; updateBlock: (i: number, d: BlockData) => void }) {
  const items = (block.data.items as { front: string; back: string }[]) ?? []

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-lg border border-rule/50 p-3 space-y-1.5">
          <div className="flex items-center gap-2">
            <input
              value={item.front}
              onChange={(e) => {
                const next = [...items]
                next[i] = { ...next[i], front: e.target.value }
                updateBlock(index, { items: next })
              }}
              placeholder="Front (visible)..."
              className="flex-1 bg-cream-soft/30 border border-rule rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-olive"
            />
            <button
              type="button"
              onClick={() => updateBlock(index, { items: items.filter((_, j) => j !== i) })}
              className="rounded p-1 text-ink-soft hover:text-rosewood transition"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>
          <textarea
            value={item.back}
            onChange={(e) => {
              const next = [...items]
              next[i] = { ...next[i], back: e.target.value }
              updateBlock(index, { items: next })
            }}
            placeholder="Back (revealed on flip)..."
            rows={2}
            className="w-full bg-cream-soft/30 border border-rule rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-olive resize-y"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() => updateBlock(index, { items: [...items, { front: '', back: '' }] })}
        className="font-mono text-xs text-sienna hover:underline"
      >
        + Add card
      </button>
    </div>
  )
}

function HotspotEditor({ block, index, updateBlock }: { block: Block; index: number; updateBlock: (i: number, d: BlockData) => void }) {
  const spots = (block.data.spots as { x: number; y: number; label: string; description: string }[]) ?? []

  return (
    <div className="space-y-3">
      <input
        value={block.data.imageUrl ?? ''}
        onChange={(e) => updateBlock(index, { imageUrl: e.target.value })}
        placeholder="Image URL..."
        className="w-full bg-cream-soft/30 border border-rule rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-olive"
      />
      {block.data.imageUrl && (
        <div className="rounded-lg border border-rule overflow-hidden max-h-32">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={block.data.imageUrl} alt="preview" className="w-full h-32 object-cover" />
        </div>
      )}
      <p className="font-mono text-[10px] tracking-[0.2em] text-ink-soft uppercase">Hotspot points</p>
      {spots.map((spot, i) => (
        <div key={i} className="rounded-lg border border-rule/50 p-3 space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="flex gap-2 shrink-0">
              <input
                type="number"
                value={spot.x}
                onChange={(e) => {
                  const next = [...spots]
                  next[i] = { ...next[i], x: parseFloat(e.target.value) || 0 }
                  updateBlock(index, { spots: next })
                }}
                placeholder="X%"
                className="w-16 bg-cream-soft/30 border border-rule rounded-lg px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-olive"
              />
              <input
                type="number"
                value={spot.y}
                onChange={(e) => {
                  const next = [...spots]
                  next[i] = { ...next[i], y: parseFloat(e.target.value) || 0 }
                  updateBlock(index, { spots: next })
                }}
                placeholder="Y%"
                className="w-16 bg-cream-soft/30 border border-rule rounded-lg px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-olive"
              />
            </div>
            <input
              value={spot.label}
              onChange={(e) => {
                const next = [...spots]
                next[i] = { ...next[i], label: e.target.value }
                updateBlock(index, { spots: next })
              }}
              placeholder="Label..."
              className="flex-1 bg-cream-soft/30 border border-rule rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-olive"
            />
            <button
              type="button"
              onClick={() => updateBlock(index, { spots: spots.filter((_, j) => j !== i) })}
              className="rounded p-1 text-ink-soft hover:text-rosewood transition"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>
          <input
            value={spot.description}
            onChange={(e) => {
              const next = [...spots]
              next[i] = { ...next[i], description: e.target.value }
              updateBlock(index, { spots: next })
            }}
            placeholder="Description..."
            className="w-full bg-cream-soft/30 border border-rule rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-olive"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() => updateBlock(index, { spots: [...spots, { x: 50, y: 50, label: '', description: '' }] })}
        className="font-mono text-xs text-sienna hover:underline"
      >
        + Add hotspot
      </button>
    </div>
  )
}

function TimelineEditor({ block, index, updateBlock }: { block: Block; index: number; updateBlock: (i: number, d: BlockData) => void }) {
  const items = (block.data.items as { time: string; title: string; description: string }[]) ?? []

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex gap-3 items-start">
          <div className="flex h-3 w-3 shrink-0 mt-3 rounded-full bg-sienna/30" />
          <div className="flex-1 space-y-1.5">
            <div className="flex gap-2">
              <input
                value={item.time}
                onChange={(e) => {
                  const next = [...items]
                  next[i] = { ...next[i], time: e.target.value }
                  updateBlock(index, { items: next })
                }}
                placeholder="Time / label..."
                className="w-28 bg-cream-soft/30 border border-rule rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-olive"
              />
              <input
                value={item.title}
                onChange={(e) => {
                  const next = [...items]
                  next[i] = { ...next[i], title: e.target.value }
                  updateBlock(index, { items: next })
                }}
                placeholder="Title..."
                className="flex-1 bg-cream-soft/30 border border-rule rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-olive"
              />
            </div>
            <textarea
              value={item.description}
              onChange={(e) => {
                const next = [...items]
                next[i] = { ...next[i], description: e.target.value }
                updateBlock(index, { items: next })
              }}
              placeholder="Description..."
              rows={2}
              className="w-full bg-cream-soft/30 border border-rule rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-olive resize-y"
            />
          </div>
          <button
            type="button"
            onClick={() => updateBlock(index, { items: items.filter((_, j) => j !== i) })}
            className="mt-1 rounded p-1 text-ink-soft hover:text-rosewood transition"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => updateBlock(index, { items: [...items, { time: '', title: '', description: '' }] })}
        className="font-mono text-xs text-sienna hover:underline"
      >
        + Add timeline item
      </button>
    </div>
  )
}

function MatchingEditor({ block, index, updateBlock }: { block: Block; index: number; updateBlock: (i: number, d: BlockData) => void }) {
  const pairs = (block.data.pairs as { left: string; right: string }[]) ?? []

  return (
    <div className="space-y-3">
      <input
        value={block.data.instruction ?? ''}
        onChange={(e) => updateBlock(index, { instruction: e.target.value })}
        placeholder="Instruction text (e.g. Match each wine to its food pairing)..."
        className="w-full bg-cream-soft/30 border border-rule rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-olive"
      />
      <p className="font-mono text-[10px] tracking-[0.2em] text-ink-soft uppercase">Pairs</p>
      {pairs.map((pair, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            value={pair.left}
            onChange={(e) => {
              const next = [...pairs]
              next[i] = { ...next[i], left: e.target.value }
              updateBlock(index, { pairs: next })
            }}
            placeholder="Left item..."
            className="flex-1 bg-cream-soft/30 border border-rule rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-olive"
          />
          <span className="text-ink-soft text-xs">{'\u2194'}</span>
          <input
            value={pair.right}
            onChange={(e) => {
              const next = [...pairs]
              next[i] = { ...next[i], right: e.target.value }
              updateBlock(index, { pairs: next })
            }}
            placeholder="Right item..."
            className="flex-1 bg-cream-soft/30 border border-rule rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-olive"
          />
          <button
            type="button"
            onClick={() => updateBlock(index, { pairs: pairs.filter((_, j) => j !== i) })}
            className="rounded p-1 text-ink-soft hover:text-rosewood transition"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => updateBlock(index, { pairs: [...pairs, { left: '', right: '' }] })}
        className="font-mono text-xs text-sienna hover:underline"
      >
        + Add pair
      </button>
    </div>
  )
}

function RevealEditor({ block, index, updateBlock }: { block: Block; index: number; updateBlock: (i: number, d: BlockData) => void }) {
  const sections = (block.data.sections as { title: string; content: string }[]) ?? []

  return (
    <div className="space-y-3">
      {sections.map((section, i) => (
        <div key={i} className="rounded-lg border border-rule/50 p-3 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-ink-soft shrink-0">#{i + 1}</span>
            <input
              value={section.title}
              onChange={(e) => {
                const next = [...sections]
                next[i] = { ...next[i], title: e.target.value }
                updateBlock(index, { sections: next })
              }}
              placeholder="Section title..."
              className="flex-1 bg-cream-soft/30 border border-rule rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-olive"
            />
            <button
              type="button"
              onClick={() => updateBlock(index, { sections: sections.filter((_, j) => j !== i) })}
              className="rounded p-1 text-ink-soft hover:text-rosewood transition"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>
          <textarea
            value={section.content}
            onChange={(e) => {
              const next = [...sections]
              next[i] = { ...next[i], content: e.target.value }
              updateBlock(index, { sections: next })
            }}
            placeholder="Section content..."
            rows={2}
            className="w-full bg-cream-soft/30 border border-rule rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-olive resize-y"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() => updateBlock(index, { sections: [...sections, { title: '', content: '' }] })}
        className="font-mono text-xs text-sienna hover:underline"
      >
        + Add section
      </button>
    </div>
  )
}

function HighlightEditor({ block, index, updateBlock }: { block: Block; index: number; updateBlock: (i: number, d: BlockData) => void }) {
  const definitions = (block.data.definitions as Record<string, string>) ?? {}
  const defEntries = Object.entries(definitions)
  const [newTerm, setNewTerm] = useState('')

  return (
    <div className="space-y-3">
      <div>
        <p className="font-mono text-[10px] text-ink-soft mb-1">Wrap terms in {'{'}curly braces{'}'} to make them interactive</p>
        <textarea
          value={block.data.text ?? ''}
          onChange={(e) => updateBlock(index, { text: e.target.value })}
          placeholder="At Still and Social, we practice {intentional hospitality} through {presence}..."
          rows={3}
          className="w-full bg-cream-soft/30 border border-rule rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-olive resize-y"
        />
      </div>
      <p className="font-mono text-[10px] tracking-[0.2em] text-ink-soft uppercase">Definitions</p>
      {defEntries.map(([term, def], i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="mt-2 font-mono text-xs text-sienna shrink-0 min-w-[80px]">{term}</span>
          <input
            value={def}
            onChange={(e) => {
              const next = { ...definitions, [term]: e.target.value }
              updateBlock(index, { definitions: next })
            }}
            placeholder="Definition..."
            className="flex-1 bg-cream-soft/30 border border-rule rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-olive"
          />
          <button
            type="button"
            onClick={() => {
              const next = { ...definitions }
              delete next[term]
              updateBlock(index, { definitions: next })
            }}
            className="mt-1 rounded p-1 text-ink-soft hover:text-rosewood transition"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <input
          value={newTerm}
          onChange={(e) => setNewTerm(e.target.value)}
          placeholder="New term..."
          className="w-40 bg-cream-soft/30 border border-rule rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-olive"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && newTerm.trim()) {
              updateBlock(index, { definitions: { ...definitions, [newTerm.trim()]: '' } })
              setNewTerm('')
            }
          }}
        />
        <button
          type="button"
          onClick={() => {
            if (newTerm.trim()) {
              updateBlock(index, { definitions: { ...definitions, [newTerm.trim()]: '' } })
              setNewTerm('')
            }
          }}
          className="font-mono text-xs text-sienna hover:underline"
        >
          + Add definition
        </button>
      </div>
    </div>
  )
}

function ComparisonEditor({ block, index, updateBlock }: { block: Block; index: number; updateBlock: (i: number, d: BlockData) => void }) {
  const before = (block.data.before as { label: string; text: string }) ?? { label: 'Instead of this', text: '' }
  const after = (block.data.after as { label: string; text: string }) ?? { label: 'Try this', text: '' }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2 rounded-lg border border-rosewood/20 bg-rosewood/5 p-3">
        <input
          value={before.label}
          onChange={(e) => updateBlock(index, { before: { ...before, label: e.target.value } })}
          placeholder="Label (e.g. Instead of this)..."
          className="w-full bg-white/60 border border-rule rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-olive"
        />
        <textarea
          value={before.text}
          onChange={(e) => updateBlock(index, { before: { ...before, text: e.target.value } })}
          placeholder="Describe the wrong approach..."
          rows={3}
          className="w-full bg-white/60 border border-rule rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-olive resize-y"
        />
      </div>
      <div className="space-y-2 rounded-lg border border-sage/30 bg-sage/5 p-3">
        <input
          value={after.label}
          onChange={(e) => updateBlock(index, { after: { ...after, label: e.target.value } })}
          placeholder="Label (e.g. Try this)..."
          className="w-full bg-white/60 border border-rule rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-olive"
        />
        <textarea
          value={after.text}
          onChange={(e) => updateBlock(index, { after: { ...after, text: e.target.value } })}
          placeholder="Describe the right approach..."
          rows={3}
          className="w-full bg-white/60 border border-rule rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-olive resize-y"
        />
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────
   Preview block (simplified inline preview)
   ──────────────────────────────────────────── */

function PreviewBlock({ block }: { block: Block }) {
  switch (block.type) {
    case 'text':
      return (
        <div
          className="prose prose-sm max-w-none font-mono text-ink prose-headings:font-serif prose-headings:font-light prose-headings:text-ink prose-p:text-ink-soft prose-a:text-sienna prose-strong:text-ink"
          dangerouslySetInnerHTML={{ __html: block.data.html ?? '' }}
        />
      )
    case 'heading': {
      const lvl = block.data.level ?? 3
      const Tag = `h${lvl}` as 'h2' | 'h3' | 'h4'
      const sizes = { 2: 'text-2xl', 3: 'text-xl', 4: 'text-lg' }
      return <Tag className={`font-serif font-light text-ink ${sizes[lvl]}`}>{block.data.text}</Tag>
    }
    case 'image':
      return block.data.url ? (
        <figure className="overflow-hidden rounded-xl border border-rule">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={block.data.url} alt={block.data.alt ?? ''} className="w-full object-cover" />
          {block.data.caption && <figcaption className="border-t border-rule bg-cream-soft/50 px-4 py-2 font-mono text-xs text-ink-soft">{block.data.caption}</figcaption>}
        </figure>
      ) : null
    case 'tip':
      return (
        <div className="rounded-xl border-l-4 border-sienna bg-sienna/5 px-5 py-4">
          <p className="font-mono text-[10px] tracking-[0.2em] text-sienna uppercase mb-1">{block.data.title || 'Tip'}</p>
          <p className="font-mono text-sm text-ink-soft">{block.data.text}</p>
        </div>
      )
    case 'quote':
      return (
        <blockquote className="border-l-4 border-rosewood/30 py-2 pl-6">
          <p className="font-serif text-xl font-light italic text-rosewood">&ldquo;{block.data.text}&rdquo;</p>
          {block.data.attribution && <cite className="mt-2 block font-mono text-xs text-ink-soft not-italic">&mdash; {block.data.attribution}</cite>}
        </blockquote>
      )
    case 'steps':
      return (
        <div className="space-y-3">
          {((block.data.items as { title: string; description: string }[]) ?? []).map((s, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sienna text-cream font-serif text-xs">{i + 1}</div>
              <div>
                <p className="font-mono text-sm font-medium text-ink">{s.title}</p>
                <p className="font-mono text-sm text-ink-soft">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      )
    case 'checklist':
      return (
        <div className="space-y-1">
          {((block.data.items as string[]) ?? []).map((item, i) => (
            <div key={i} className="flex items-center gap-2 font-mono text-sm text-ink-soft"><span>{'\u2610'}</span> {item}</div>
          ))}
        </div>
      )
    case 'divider':
      return <div className="flex items-center justify-center gap-3 py-2 text-oatmeal select-none"><span>{'\u00b7'}</span><span>{'\u00b7'}</span><span>{'\u00b7'}</span></div>
    case 'callout': {
      const ct = block.data.type ?? 'info'
      const colors = { info: 'border-olive bg-olive/5', warning: 'border-sienna bg-sienna/5', success: 'border-sage bg-sage/5' }
      return (
        <div className={`rounded-xl border ${colors[ct]} px-5 py-4`}>
          <p className="font-mono text-sm text-ink-soft">{block.data.text}</p>
        </div>
      )
    }
    case 'accordion':
      return (
        <div className="divide-y divide-rule overflow-hidden rounded-xl border border-rule">
          {((block.data.items as { title: string; content: string }[]) ?? []).map((item, i) => (
            <div key={i} className="bg-white/60 px-5 py-3">
              <p className="font-mono text-sm font-medium text-ink">{'\u25b8'} {item.title}</p>
            </div>
          ))}
        </div>
      )
    case 'welcome_video':
      return (
        <div className="rounded-xl border border-rule bg-charcoal/5 p-4">
          <p className="font-mono text-[10px] tracking-[0.2em] text-sienna uppercase mb-1">Welcome Video</p>
          <p className="font-serif text-base text-ink">{block.data.title || 'Untitled'}</p>
          {(block.data as any).subtitle && <p className="font-mono text-xs text-ink-soft">{(block.data as any).subtitle}</p>}
        </div>
      )
    // Preview for interactive blocks
    case 'scenario':
      return (
        <div className="rounded-xl border border-rule bg-charcoal/5 p-4">
          <p className="font-mono text-[10px] tracking-[0.2em] text-sienna uppercase mb-1">Scenario</p>
          <p className="font-mono text-sm text-ink">{block.data.situation}</p>
          <p className="font-mono text-xs text-ink-soft mt-1">{(block.data.options as unknown[])?.length ?? 0} options</p>
        </div>
      )
    case 'flipcards':
      return (
        <div className="rounded-xl border border-rule bg-charcoal/5 p-4">
          <p className="font-mono text-[10px] tracking-[0.2em] text-sienna uppercase mb-1">Flip Cards</p>
          <p className="font-mono text-xs text-ink-soft">{(block.data.items as unknown[])?.length ?? 0} cards</p>
        </div>
      )
    case 'hotspot':
      return (
        <div className="rounded-xl border border-rule bg-charcoal/5 p-4">
          <p className="font-mono text-[10px] tracking-[0.2em] text-sienna uppercase mb-1">Image Hotspot</p>
          <p className="font-mono text-xs text-ink-soft">{(block.data.spots as unknown[])?.length ?? 0} points</p>
        </div>
      )
    case 'timeline':
      return (
        <div className="rounded-xl border border-rule bg-charcoal/5 p-4">
          <p className="font-mono text-[10px] tracking-[0.2em] text-sienna uppercase mb-1">Timeline</p>
          <p className="font-mono text-xs text-ink-soft">{(block.data.items as unknown[])?.length ?? 0} items</p>
        </div>
      )
    case 'matching':
      return (
        <div className="rounded-xl border border-rule bg-charcoal/5 p-4">
          <p className="font-mono text-[10px] tracking-[0.2em] text-sienna uppercase mb-1">Matching</p>
          <p className="font-mono text-xs text-ink-soft">{block.data.instruction} ({(block.data.pairs as unknown[])?.length ?? 0} pairs)</p>
        </div>
      )
    case 'reveal':
      return (
        <div className="rounded-xl border border-rule bg-charcoal/5 p-4">
          <p className="font-mono text-[10px] tracking-[0.2em] text-sienna uppercase mb-1">Progressive Reveal</p>
          <p className="font-mono text-xs text-ink-soft">{(block.data.sections as unknown[])?.length ?? 0} sections</p>
        </div>
      )
    case 'highlight':
      return (
        <div className="rounded-xl border border-rule bg-charcoal/5 p-4">
          <p className="font-mono text-[10px] tracking-[0.2em] text-sienna uppercase mb-1">Highlight Text</p>
          <p className="font-mono text-xs text-ink-soft">{Object.keys(block.data.definitions ?? {}).length} definitions</p>
        </div>
      )
    case 'comparison':
      return (
        <div className="rounded-xl border border-rule bg-charcoal/5 p-4 grid grid-cols-2 gap-2">
          <div className="rounded border border-rosewood/20 bg-rosewood/5 px-3 py-2">
            <p className="font-mono text-[10px] text-rosewood uppercase">{(block.data.before as { label: string })?.label}</p>
          </div>
          <div className="rounded border border-sage/30 bg-sage/5 px-3 py-2">
            <p className="font-mono text-[10px] text-sage uppercase">{(block.data.after as { label: string })?.label}</p>
          </div>
        </div>
      )
    default:
      return null
  }
}
