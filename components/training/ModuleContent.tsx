'use client'

import { useState } from 'react'

/* ────────────────────────────────────────────
   Block type definitions
   ──────────────────────────────────────────── */

type Block =
  | { type: 'text'; data: { html: string } }
  | { type: 'heading'; data: { text: string; level?: 2 | 3 | 4 } }
  | { type: 'image'; data: { url: string; alt?: string; caption?: string; fullWidth?: boolean } }
  | { type: 'video'; data: { url: string; provider?: 'youtube' | 'vimeo' | 'direct' } }
  | { type: 'tip'; data: { text: string; title?: string } }
  | { type: 'quote'; data: { text: string; attribution?: string } }
  | { type: 'steps'; data: { items: { title: string; description: string }[] } }
  | { type: 'checklist'; data: { items: string[] } }
  | { type: 'divider'; data: Record<string, never> }
  | { type: 'callout'; data: { text: string; type?: 'info' | 'warning' | 'success' } }
  | { type: 'accordion'; data: { items: { title: string; content: string }[] } }
  // Legacy compat
  | { type: 'pdf'; data: { url?: string; src?: string; title?: string } }

/* ────────────────────────────────────────────
   Main component
   ──────────────────────────────────────────── */

export function ModuleContent({
  blocks,
  moduleId,
}: {
  blocks: Block[]
  moduleId: string
}) {
  if (!blocks || blocks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-oatmeal bg-cream-soft/50 px-6 py-8 text-center">
        <p className="font-mono text-sm text-ink-soft">
          No content has been added to this module yet.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {blocks.map((block, i) => (
        <ContentBlockRenderer key={`${moduleId}-${i}`} block={block} />
      ))}
    </div>
  )
}

/* ────────────────────────────────────────────
   Block renderer
   ──────────────────────────────────────────── */

function ContentBlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case 'text':
      return (
        <div
          className="prose prose-sm max-w-none font-mono text-ink prose-headings:font-serif prose-headings:font-light prose-headings:text-ink prose-p:text-ink-soft prose-a:text-sienna prose-strong:text-ink prose-li:text-ink-soft"
          dangerouslySetInnerHTML={{ __html: block.data.html ?? '' }}
        />
      )

    case 'heading': {
      const level = block.data.level ?? 3
      const Tag = `h${level}` as 'h2' | 'h3' | 'h4'
      const sizes = { 2: 'text-2xl', 3: 'text-xl', 4: 'text-lg' }
      return (
        <Tag className={`font-serif font-light text-ink ${sizes[level]}`}>
          {block.data.text}
        </Tag>
      )
    }

    case 'image':
      return (
        <figure className={`overflow-hidden rounded-xl border border-rule ${block.data.fullWidth ? '' : 'mx-auto max-w-lg'}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={block.data.url}
            alt={block.data.alt ?? block.data.caption ?? 'Module image'}
            className="w-full object-cover"
          />
          {block.data.caption && (
            <figcaption className="border-t border-rule bg-cream-soft/50 px-4 py-2 font-mono text-xs text-ink-soft">
              {block.data.caption}
            </figcaption>
          )}
        </figure>
      )

    case 'video':
      return <VideoBlock url={block.data.url} provider={block.data.provider} />

    case 'tip':
      return (
        <div className="rounded-xl border-l-4 border-sienna bg-sienna/5 px-5 py-4">
          <div className="mb-1.5 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sienna shrink-0">
              <path d="M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z" />
              <path d="M10 21h4" />
            </svg>
            <span className="font-mono text-[10px] tracking-[0.2em] text-sienna uppercase">
              {block.data.title || 'Tip'}
            </span>
          </div>
          <p className="font-mono text-sm text-ink-soft leading-relaxed">
            {block.data.text}
          </p>
        </div>
      )

    case 'quote':
      return (
        <blockquote className="border-l-4 border-rosewood/30 py-2 pl-6 pr-4">
          <p className="font-serif text-xl font-light italic text-rosewood leading-relaxed">
            &ldquo;{block.data.text}&rdquo;
          </p>
          {block.data.attribution && (
            <cite className="mt-2 block font-mono text-xs text-ink-soft not-italic">
              &mdash; {block.data.attribution}
            </cite>
          )}
        </blockquote>
      )

    case 'steps':
      return (
        <div className="space-y-4">
          {(block.data.items ?? []).map((step, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sienna text-cream font-serif text-sm">
                {i + 1}
              </div>
              <div className="pt-0.5">
                <p className="font-mono text-sm font-medium text-ink">{step.title}</p>
                <p className="mt-0.5 font-mono text-sm text-ink-soft leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      )

    case 'checklist':
      return <ChecklistBlock items={block.data.items ?? []} />

    case 'divider':
      return (
        <div className="flex items-center justify-center gap-3 py-2 text-oatmeal select-none" aria-hidden="true">
          <span>·</span><span>·</span><span>·</span>
        </div>
      )

    case 'callout': {
      const calloutType = block.data.type ?? 'info'
      const styles = {
        info: { border: 'border-olive', bg: 'bg-olive/5', icon: 'text-olive', label: 'Note' },
        warning: { border: 'border-sienna', bg: 'bg-sienna/5', icon: 'text-sienna', label: 'Important' },
        success: { border: 'border-sage', bg: 'bg-sage/5', icon: 'text-sage', label: 'Success' },
      }
      const s = styles[calloutType]
      return (
        <div className={`rounded-xl border ${s.border} ${s.bg} px-5 py-4`}>
          <div className="mb-1.5 flex items-center gap-2">
            {calloutType === 'info' && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={s.icon}><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
            )}
            {calloutType === 'warning' && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={s.icon}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" /></svg>
            )}
            {calloutType === 'success' && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={s.icon}><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg>
            )}
            <span className={`font-mono text-[10px] tracking-[0.2em] uppercase ${s.icon}`}>
              {s.label}
            </span>
          </div>
          <p className="font-mono text-sm text-ink-soft leading-relaxed">{block.data.text}</p>
        </div>
      )
    }

    case 'accordion':
      return (
        <div className="divide-y divide-rule overflow-hidden rounded-xl border border-rule">
          {(block.data.items ?? []).map((item, i) => (
            <AccordionItem key={i} title={item.title} content={item.content} />
          ))}
        </div>
      )

    case 'pdf':
      return (
        <a
          href={block.data.url ?? block.data.src ?? '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl border border-rule bg-white/60 p-4 transition hover:border-sienna/30"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rosewood/10">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-rosewood">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <path d="M14 2v6h6" />
            </svg>
          </div>
          <div>
            <p className="font-mono text-sm font-medium text-ink">{block.data.title ?? 'View PDF Document'}</p>
            <p className="font-mono text-xs text-ink-soft">Click to open in a new tab</p>
          </div>
        </a>
      )

    default:
      return null
  }
}

/* ────────────────────────────────────────────
   Sub-components
   ──────────────────────────────────────────── */

function VideoBlock({ url, provider }: { url: string; provider?: string }) {
  const detected = provider ?? detectVideoProvider(url)

  return (
    <div className="overflow-hidden rounded-xl border border-rule">
      <div className="aspect-video bg-charcoal/5">
        {detected === 'youtube' ? (
          <iframe
            src={toYouTubeEmbed(url)}
            className="h-full w-full"
            allowFullScreen
            title="Training video"
          />
        ) : detected === 'vimeo' ? (
          <iframe
            src={toVimeoEmbed(url)}
            className="h-full w-full"
            allowFullScreen
            title="Training video"
          />
        ) : (
          <video src={url} controls className="h-full w-full">
            <track kind="captions" />
          </video>
        )}
      </div>
    </div>
  )
}

function ChecklistBlock({ items }: { items: string[] }) {
  const [checked, setChecked] = useState<Record<number, boolean>>({})

  const toggle = (index: number) => {
    setChecked((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  const checkedCount = Object.values(checked).filter(Boolean).length

  return (
    <div className="rounded-xl border border-rule bg-white/60 p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-mono text-[10px] tracking-widest text-ink-soft uppercase">
          Checklist
        </p>
        <p className="font-mono text-xs text-ink-soft">
          {checkedCount}/{items.length} completed
        </p>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <label
            key={i}
            className="flex cursor-pointer items-start gap-3 rounded-lg p-2 transition hover:bg-cream-soft/50"
          >
            <input
              type="checkbox"
              checked={!!checked[i]}
              onChange={() => toggle(i)}
              className="mt-0.5 h-4 w-4 rounded border-rule text-sienna accent-sienna"
            />
            <span
              className={`font-mono text-sm ${checked[i] ? 'text-ink-soft line-through' : 'text-ink'}`}
            >
              {item}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}

function AccordionItem({ title, content }: { title: string; content: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-white/60">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-cream-soft/40"
      >
        <span className="font-mono text-sm font-medium text-ink">{title}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={`text-ink-soft shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="border-t border-rule/50 px-5 py-4">
          <p className="font-mono text-sm text-ink-soft leading-relaxed">{content}</p>
        </div>
      )}
    </div>
  )
}

/* ────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────── */

function detectVideoProvider(url: string): 'youtube' | 'vimeo' | 'direct' {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  if (url.includes('vimeo.com')) return 'vimeo'
  return 'direct'
}

function toYouTubeEmbed(url: string): string {
  try {
    const u = new URL(url)
    let videoId = u.searchParams.get('v')
    if (!videoId && u.hostname === 'youtu.be') {
      videoId = u.pathname.slice(1)
    }
    if (!videoId && u.pathname.includes('/embed/')) {
      videoId = u.pathname.split('/embed/')[1]
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url
  } catch {
    return url
  }
}

function toVimeoEmbed(url: string): string {
  try {
    const u = new URL(url)
    const id = u.pathname.split('/').filter(Boolean).pop()
    return id ? `https://player.vimeo.com/video/${id}` : url
  } catch {
    return url
  }
}
