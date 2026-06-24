'use client'

import { useState, useRef, useCallback } from 'react'

/* ────────────────────────────────────────────
   Types
   ──────────────────────────────────────────── */

type BlockType = 'text' | 'heading' | 'image' | 'video' | 'tip' | 'quote' | 'steps' | 'checklist' | 'divider' | 'callout' | 'accordion'

interface BlockData {
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
}

interface Block {
  type: BlockType
  data: BlockData
}

/* ────────────────────────────────────────────
   Block palette config
   ──────────────────────────────────────────── */

const BLOCK_TYPES: { type: BlockType; label: string; icon: string; desc: string }[] = [
  { type: 'text', label: 'Text', icon: 'T', desc: 'Rich text paragraph' },
  { type: 'heading', label: 'Heading', icon: 'H', desc: 'Section heading' },
  { type: 'image', label: 'Image', icon: '🖼', desc: 'Image with caption' },
  { type: 'video', label: 'Video', icon: '▶', desc: 'YouTube/Vimeo/direct' },
  { type: 'tip', label: 'Tip', icon: '💡', desc: 'Highlighted tip' },
  { type: 'quote', label: 'Quote', icon: '❝', desc: 'Styled pullquote' },
  { type: 'steps', label: 'Steps', icon: '①', desc: 'Step-by-step guide' },
  { type: 'checklist', label: 'Checklist', icon: '☑', desc: 'Interactive checklist' },
  { type: 'divider', label: 'Divider', icon: '···', desc: 'Visual separator' },
  { type: 'callout', label: 'Callout', icon: '!', desc: 'Important info box' },
  { type: 'accordion', label: 'Accordion', icon: '▸', desc: 'Expandable FAQ' },
]

function createEmptyBlock(type: BlockType): Block {
  switch (type) {
    case 'text': return { type, data: { html: '' } }
    case 'heading': return { type, data: { text: '', level: 3 } }
    case 'image': return { type, data: { url: '', alt: '', caption: '' } }
    case 'video': return { type, data: { url: '' } }
    case 'tip': return { type, data: { text: '', title: '' } }
    case 'quote': return { type, data: { text: '', attribution: '' } }
    case 'steps': return { type, data: { items: [{ title: '', description: '' }] } }
    case 'checklist': return { type, data: { items: [''] } }
    case 'divider': return { type, data: {} }
    case 'callout': return { type, data: { text: '', type: 'info' } }
    case 'accordion': return { type, data: { items: [{ title: '', content: '' }] } }
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
  saveAction,
}: {
  initialBlocks: Block[]
  moduleId: string
  pathId: string
  title: string
  description: string
  estimatedMinutes: number
  saveAction: (moduleId: string, data: { title: string; description: string; estimatedMinutes: number; blocks: unknown[] }) => Promise<{ error?: string }>
}) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks.length > 0 ? initialBlocks : [])
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription)
  const [estimatedMinutes, setEstimatedMinutes] = useState(initialMinutes)
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
                      <span className="cursor-grab text-ink-soft select-none" title="Drag to reorder">⋮⋮</span>
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
          <h3 className="font-mono text-[10px] tracking-[0.2em] text-ink-soft uppercase mb-3">Add Block</h3>
          <div className="grid grid-cols-2 gap-2">
            {BLOCK_TYPES.map((bt) => (
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
        <div ref={addMenuRef} className="absolute top-full left-1/2 z-20 mt-1 -translate-x-1/2 rounded-xl border border-rule bg-cream shadow-lg p-3 w-72">
          <p className="font-mono text-[10px] tracking-[0.2em] text-ink-soft uppercase mb-2">Choose block type</p>
          <div className="grid grid-cols-2 gap-1.5">
            {BLOCK_TYPES.map((bt) => (
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
          <span>· · ·</span>
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

    default:
      return <p className="font-mono text-xs text-ink-soft">Unknown block type</p>
  }
}

/* ────────────────────────────────────────────
   Steps editor
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

/* ────────────────────────────────────────────
   Checklist editor
   ──────────────────────────────────────────── */

function ChecklistEditor({ block, index, updateBlock }: { block: Block; index: number; updateBlock: (i: number, d: BlockData) => void }) {
  const items = (block.data.items as string[]) ?? []

  const updateItems = (newItems: string[]) => {
    updateBlock(index, { items: newItems })
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-ink-soft">☐</span>
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

/* ────────────────────────────────────────────
   Accordion editor
   ──────────────────────────────────────────── */

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
            <span className="text-ink-soft text-xs">▸</span>
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
            <div key={i} className="flex items-center gap-2 font-mono text-sm text-ink-soft"><span>☐</span> {item}</div>
          ))}
        </div>
      )
    case 'divider':
      return <div className="flex items-center justify-center gap-3 py-2 text-oatmeal select-none"><span>·</span><span>·</span><span>·</span></div>
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
              <p className="font-mono text-sm font-medium text-ink">▸ {item.title}</p>
            </div>
          ))}
        </div>
      )
    default:
      return null
  }
}
