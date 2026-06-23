'use client'

import { useState } from 'react'

interface ContentBlock {
  type: 'text' | 'image' | 'video' | 'pdf' | 'checklist'
  data: {
    html?: string
    src?: string
    url?: string
    caption?: string
    title?: string
    items?: string[]
  }
}

export function ModuleContent({
  blocks,
  moduleId,
}: {
  blocks: ContentBlock[]
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

function ContentBlockRenderer({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'text':
      return (
        <div
          className="prose prose-sm max-w-none font-mono text-ink prose-headings:font-serif prose-headings:font-light prose-headings:text-ink prose-p:text-ink-soft prose-a:text-sienna prose-strong:text-ink"
          dangerouslySetInnerHTML={{ __html: block.data.html ?? '' }}
        />
      )

    case 'image':
      return (
        <figure className="overflow-hidden rounded-xl border border-rule">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={block.data.src ?? block.data.url ?? ''}
            alt={block.data.caption ?? 'Training image'}
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
      return (
        <div className="overflow-hidden rounded-xl border border-rule">
          <div className="aspect-video bg-charcoal/5">
            {(block.data.url ?? block.data.src ?? '').includes('youtube') ||
            (block.data.url ?? block.data.src ?? '').includes('youtu.be') ? (
              <iframe
                src={toYouTubeEmbed(block.data.url ?? block.data.src ?? '')}
                className="h-full w-full"
                allowFullScreen
                title={block.data.caption ?? 'Training video'}
              />
            ) : (
              <video
                src={block.data.url ?? block.data.src ?? ''}
                controls
                className="h-full w-full"
              >
                <track kind="captions" />
              </video>
            )}
          </div>
          {block.data.caption && (
            <p className="border-t border-rule bg-cream-soft/50 px-4 py-2 font-mono text-xs text-ink-soft">
              {block.data.caption}
            </p>
          )}
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
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-rosewood"
            >
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <path d="M14 2v6h6" />
            </svg>
          </div>
          <div>
            <p className="font-mono text-sm font-medium text-ink">
              {block.data.title ?? 'View PDF Document'}
            </p>
            <p className="font-mono text-xs text-ink-soft">
              Click to open in a new tab
            </p>
          </div>
        </a>
      )

    case 'checklist':
      return <ChecklistBlock items={block.data.items ?? []} />

    default:
      return null
  }
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

function toYouTubeEmbed(url: string): string {
  try {
    const u = new URL(url)
    let videoId = u.searchParams.get('v')
    if (!videoId && u.hostname === 'youtu.be') {
      videoId = u.pathname.slice(1)
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url
  } catch {
    return url
  }
}
