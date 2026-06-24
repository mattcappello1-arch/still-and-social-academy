'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

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
  // Interactive blocks
  | { type: 'scenario'; data: { situation: string; options: { text: string; correct: boolean; feedback: string }[] } }
  | { type: 'flipcards'; data: { items: { front: string; back: string }[] } }
  | { type: 'hotspot'; data: { imageUrl: string; spots: { x: number; y: number; label: string; description: string }[] } }
  | { type: 'timeline'; data: { items: { time: string; title: string; description: string }[] } }
  | { type: 'matching'; data: { instruction: string; pairs: { left: string; right: string }[] } }
  | { type: 'reveal'; data: { sections: { title: string; content: string }[] } }
  | { type: 'highlight'; data: { text: string; definitions: Record<string, string> } }
  | { type: 'comparison'; data: { before: { label: string; text: string }; after: { label: string; text: string } } }
  // Welcome video
  | { type: 'welcome_video'; data: { url: string; title: string; subtitle?: string } }
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

    case 'welcome_video':
      return <WelcomeVideoBlock url={block.data.url} title={block.data.title} subtitle={block.data.subtitle} />

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

    /* ────────────────────────────────────────────
       New interactive block types
       ──────────────────────────────────────────── */

    case 'scenario':
      return <ScenarioBlock situation={block.data.situation} options={block.data.options} />

    case 'flipcards':
      return <FlipCardsBlock items={block.data.items} />

    case 'hotspot':
      return <HotspotBlock imageUrl={block.data.imageUrl} spots={block.data.spots} />

    case 'timeline':
      return <TimelineBlock items={block.data.items} />

    case 'matching':
      return <MatchingBlock instruction={block.data.instruction} pairs={block.data.pairs} />

    case 'reveal':
      return <RevealBlock sections={block.data.sections} />

    case 'highlight':
      return <HighlightBlock text={block.data.text} definitions={block.data.definitions} />

    case 'comparison':
      return <ComparisonBlock before={block.data.before} after={block.data.after} />

    default:
      return null
  }
}

/* ────────────────────────────────────────────
   Sub-components — existing
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

function WelcomeVideoBlock({ url, title, subtitle }: { url: string; title: string; subtitle?: string }) {
  const provider = detectVideoProvider(url)

  return (
    <div className="relative overflow-hidden rounded-xl border border-rule bg-charcoal">
      <div className="aspect-video">
        {provider === 'youtube' ? (
          <iframe
            src={toYouTubeEmbed(url)}
            className="h-full w-full"
            allowFullScreen
            title={title}
          />
        ) : provider === 'vimeo' ? (
          <iframe
            src={toVimeoEmbed(url)}
            className="h-full w-full"
            allowFullScreen
            title={title}
          />
        ) : (
          <video src={url} controls className="h-full w-full">
            <track kind="captions" />
          </video>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-charcoal/90 to-transparent px-6 py-6 pointer-events-none">
        <h2 className="font-serif text-2xl font-light text-cream">{title}</h2>
        {subtitle && (
          <p className="mt-1 font-mono text-sm text-cream/70">{subtitle}</p>
        )}
      </div>
    </div>
  )
}

function ChecklistBlock({ items }: { items: string[] }) {
  const [checked, setChecked] = useState<Record<number, boolean>>({})
  const [showCelebration, setShowCelebration] = useState(false)

  const toggle = (index: number) => {
    setChecked((prev) => {
      const next = { ...prev, [index]: !prev[index] }
      // Check if all items completed
      const newCheckedCount = Object.values(next).filter(Boolean).length
      if (newCheckedCount === items.length && !prev[index]) {
        setShowCelebration(true)
        setTimeout(() => setShowCelebration(false), 2500)
      }
      return next
    })
  }

  const checkedCount = Object.values(checked).filter(Boolean).length

  return (
    <div className="relative rounded-xl border border-rule bg-white/60 p-5 overflow-hidden">
      {/* Celebration overlay */}
      {showCelebration && <CelebrationAnimation />}

      <div className="mb-3 flex items-center justify-between">
        <p className="font-mono text-[10px] tracking-widest text-ink-soft uppercase">
          Checklist
        </p>
        <p className={`font-mono text-xs transition-colors duration-300 ${checkedCount === items.length ? 'text-sage font-medium' : 'text-ink-soft'}`}>
          {checkedCount}/{items.length} completed
        </p>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <label
            key={i}
            className="flex cursor-pointer items-start gap-3 rounded-lg p-2 transition-all duration-200 hover:bg-cream-soft/50"
          >
            <input
              type="checkbox"
              checked={!!checked[i]}
              onChange={() => toggle(i)}
              className="mt-0.5 h-4 w-4 rounded border-rule text-sienna accent-sienna"
            />
            <span
              className={`font-mono text-sm transition-all duration-300 ${
                checked[i] ? 'text-ink-soft line-through opacity-60' : 'text-ink'
              }`}
            >
              {item}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}

function CelebrationAnimation() {
  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 0.5}s`,
    duration: `${1.5 + Math.random() * 1}s`,
    size: Math.random() > 0.5 ? 'w-2 h-2' : 'w-1.5 h-1.5',
    color: ['bg-sienna', 'bg-sage', 'bg-olive', 'bg-rosewood/60', 'bg-oatmeal'][Math.floor(Math.random() * 5)],
  }))

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.id}
          className={`absolute rounded-full ${p.size} ${p.color} animate-celebration`}
          style={{
            left: p.left,
            top: '-8px',
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
      <style>{`
        @keyframes celebration {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(400px) rotate(720deg); opacity: 0; }
        }
        .animate-celebration {
          animation-name: celebration;
          animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
          animation-fill-mode: forwards;
        }
      `}</style>
    </div>
  )
}

function AccordionItem({ title, content }: { title: string; content: string }) {
  const [open, setOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState(0)

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight)
    }
  }, [content, open])

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
          className={`text-ink-soft shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: open ? `${contentHeight + 32}px` : '0px', opacity: open ? 1 : 0 }}
      >
        <div ref={contentRef} className="border-t border-rule/50 px-5 py-4">
          <p className="font-mono text-sm text-ink-soft leading-relaxed">{content}</p>
        </div>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────
   New interactive components
   ──────────────────────────────────────────── */

function ScenarioBlock({ situation, options }: { situation: string; options: { text: string; correct: boolean; feedback: string }[] }) {
  const [selected, setSelected] = useState<number | null>(null)

  return (
    <div className="rounded-xl border border-rule bg-white/60 overflow-hidden">
      <div className="bg-charcoal/5 px-5 py-3 border-b border-rule">
        <div className="flex items-center gap-2 mb-1">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sienna shrink-0">
            <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
            <circle cx="12" cy="12" r="10" />
            <path d="M12 17h.01" />
          </svg>
          <span className="font-mono text-[10px] tracking-[0.2em] text-sienna uppercase">What would you do?</span>
        </div>
        <p className="font-serif text-base text-ink leading-relaxed">{situation}</p>
      </div>
      <div className="p-4 space-y-2">
        {options.map((opt, i) => {
          const isSelected = selected === i
          const isRevealed = selected !== null
          const isCorrect = opt.correct

          let borderStyle = 'border-rule'
          let bgStyle = 'bg-white/60'
          if (isRevealed && isSelected && isCorrect) {
            borderStyle = 'border-sage'
            bgStyle = 'bg-sage/5'
          } else if (isRevealed && isSelected && !isCorrect) {
            borderStyle = 'border-rosewood/40'
            bgStyle = 'bg-rosewood/5'
          } else if (isRevealed && isCorrect) {
            borderStyle = 'border-sage/40'
            bgStyle = 'bg-sage/5'
          }

          return (
            <button
              key={i}
              type="button"
              onClick={() => selected === null && setSelected(i)}
              disabled={selected !== null}
              className={`w-full text-left rounded-lg border ${borderStyle} ${bgStyle} px-4 py-3 transition-all duration-300 ${
                selected === null ? 'hover:border-sienna/30 hover:bg-cream-soft/30 cursor-pointer' : 'cursor-default'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-mono transition-colors duration-300 ${
                  isRevealed && isCorrect ? 'border-sage bg-sage text-cream' :
                  isRevealed && isSelected ? 'border-rosewood/40 bg-rosewood/10 text-rosewood' :
                  'border-rule text-ink-soft'
                }`}>
                  {isRevealed && isCorrect ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                  ) : isRevealed && isSelected ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" /></svg>
                  ) : (
                    String.fromCharCode(65 + i)
                  )}
                </span>
                <div className="flex-1">
                  <p className="font-mono text-sm text-ink">{opt.text}</p>
                  {isRevealed && (isSelected || isCorrect) && (
                    <p className={`mt-1.5 font-mono text-xs leading-relaxed transition-opacity duration-300 ${isCorrect ? 'text-sage' : 'text-rosewood/70'}`}>
                      {opt.feedback}
                    </p>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function FlipCardsBlock({ items }: { items: { front: string; back: string }[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {items.map((card, i) => (
        <FlipCard key={i} front={card.front} back={card.back} />
      ))}
    </div>
  )
}

function FlipCard({ front, back }: { front: string; back: string }) {
  const [flipped, setFlipped] = useState(false)

  return (
    <button
      type="button"
      onClick={() => setFlipped(!flipped)}
      className="group relative w-full text-left"
      style={{ perspective: '1000px' }}
    >
      <div
        className="relative transition-transform duration-500 w-full"
        style={{
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          minHeight: '140px',
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-xl border border-rule bg-white/80 p-5 flex flex-col justify-center items-center"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <p className="font-serif text-lg text-ink text-center">{front}</p>
          <p className="mt-2 font-mono text-[10px] tracking-[0.2em] text-ink-soft uppercase">Click to flip</p>
        </div>
        {/* Back */}
        <div
          className="absolute inset-0 rounded-xl border border-sienna/30 bg-sienna/5 p-5 flex items-center justify-center"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <p className="font-mono text-sm text-ink-soft leading-relaxed text-center">{back}</p>
        </div>
      </div>
    </button>
  )
}

function HotspotBlock({ imageUrl, spots }: { imageUrl: string; spots: { x: number; y: number; label: string; description: string }[] }) {
  const [activeSpot, setActiveSpot] = useState<number | null>(null)

  return (
    <div className="rounded-xl border border-rule overflow-hidden bg-white/60">
      <div className="px-4 py-2 border-b border-rule">
        <span className="font-mono text-[10px] tracking-[0.2em] text-ink-soft uppercase">Interactive image — tap the dots</span>
      </div>
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt="Interactive hotspot image" className="w-full" />
        {spots.map((spot, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActiveSpot(activeSpot === i ? null : i)}
            className={`absolute flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all duration-200 ${
              activeSpot === i
                ? 'border-sienna bg-sienna text-cream scale-125 z-10'
                : 'border-white bg-sienna/80 text-cream hover:scale-110 hover:bg-sienna'
            }`}
            style={{
              left: `${spot.x}%`,
              top: `${spot.y}%`,
              transform: `translate(-50%, -50%) ${activeSpot === i ? 'scale(1.25)' : ''}`,
            }}
            title={spot.label}
          >
            <span className="font-mono text-[10px] font-bold">{i + 1}</span>
          </button>
        ))}
        {/* Active spot popup */}
        {activeSpot !== null && spots[activeSpot] && (
          <div
            className="absolute z-20 w-56 rounded-lg border border-rule bg-cream shadow-lg p-3 transition-opacity duration-200"
            style={{
              left: `${Math.min(Math.max(spots[activeSpot].x, 20), 80)}%`,
              top: `${spots[activeSpot].y + 5}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <p className="font-mono text-xs font-medium text-ink mb-1">{spots[activeSpot].label}</p>
            <p className="font-mono text-[11px] text-ink-soft leading-relaxed">{spots[activeSpot].description}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function TimelineBlock({ items }: { items: { time: string; title: string; description: string }[] }) {
  return (
    <div className="rounded-xl border border-rule bg-white/60 p-5">
      <div className="mb-3">
        <span className="font-mono text-[10px] tracking-[0.2em] text-ink-soft uppercase">Timeline</span>
      </div>
      <div className="relative pl-6">
        {/* Vertical line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-oatmeal" />
        <div className="space-y-5">
          {items.map((item, i) => (
            <div key={i} className="relative">
              {/* Dot */}
              <div className="absolute -left-6 top-1 flex h-3.5 w-3.5 items-center justify-center">
                <div className={`h-3 w-3 rounded-full border-2 border-sienna ${i === 0 ? 'bg-sienna' : 'bg-cream'}`} />
              </div>
              <div>
                <span className="font-mono text-[10px] tracking-[0.15em] text-sienna uppercase">{item.time}</span>
                <p className="font-mono text-sm font-medium text-ink mt-0.5">{item.title}</p>
                <p className="font-mono text-sm text-ink-soft leading-relaxed mt-0.5">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MatchingBlock({ instruction, pairs }: { instruction: string; pairs: { left: string; right: string }[] }) {
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null)
  const [matches, setMatches] = useState<Record<number, number>>({})
  const [wrongFlash, setWrongFlash] = useState<number | null>(null)

  // Shuffle right side once
  const [shuffledRight] = useState<number[]>(() => {
    const indices = pairs.map((_, i) => i)
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]]
    }
    return indices
  })

  const matchedLeftIndices = new Set(Object.keys(matches).map(Number))
  const matchedRightIndices = new Set(Object.values(matches))
  const allMatched = Object.keys(matches).length === pairs.length

  const handleLeftClick = (leftIdx: number) => {
    if (matchedLeftIndices.has(leftIdx)) return
    setSelectedLeft(selectedLeft === leftIdx ? null : leftIdx)
  }

  const handleRightClick = (rightIdx: number) => {
    if (matchedRightIndices.has(rightIdx) || selectedLeft === null) return
    // Check if this is the correct match
    if (rightIdx === selectedLeft) {
      setMatches(prev => ({ ...prev, [selectedLeft]: rightIdx }))
      setSelectedLeft(null)
    } else {
      setWrongFlash(rightIdx)
      setTimeout(() => setWrongFlash(null), 600)
    }
  }

  return (
    <div className="rounded-xl border border-rule bg-white/60 overflow-hidden">
      <div className="bg-charcoal/5 px-5 py-3 border-b border-rule">
        <div className="flex items-center gap-2 mb-1">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sienna shrink-0">
            <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
          </svg>
          <span className="font-mono text-[10px] tracking-[0.2em] text-sienna uppercase">Match the pairs</span>
        </div>
        <p className="font-mono text-sm text-ink-soft">{instruction}</p>
      </div>
      <div className="p-4">
        {allMatched ? (
          <div className="flex items-center justify-center gap-2 py-6">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sage">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" />
            </svg>
            <span className="font-mono text-sm text-sage font-medium">All matched correctly</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              {pairs.map((pair, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleLeftClick(i)}
                  disabled={matchedLeftIndices.has(i)}
                  className={`w-full rounded-lg border px-3 py-2.5 text-left font-mono text-sm transition-all duration-200 ${
                    matchedLeftIndices.has(i)
                      ? 'border-sage/30 bg-sage/5 text-sage line-through opacity-60'
                      : selectedLeft === i
                      ? 'border-sienna bg-sienna/5 text-ink'
                      : 'border-rule bg-white/60 text-ink hover:border-sienna/30'
                  }`}
                >
                  {pair.left}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              {shuffledRight.map((rightIdx) => (
                <button
                  key={rightIdx}
                  type="button"
                  onClick={() => handleRightClick(rightIdx)}
                  disabled={matchedRightIndices.has(rightIdx) || selectedLeft === null}
                  className={`w-full rounded-lg border px-3 py-2.5 text-left font-mono text-sm transition-all duration-200 ${
                    matchedRightIndices.has(rightIdx)
                      ? 'border-sage/30 bg-sage/5 text-sage line-through opacity-60'
                      : wrongFlash === rightIdx
                      ? 'border-rosewood bg-rosewood/10 text-rosewood'
                      : selectedLeft !== null
                      ? 'border-rule bg-white/60 text-ink hover:border-sienna/30 cursor-pointer'
                      : 'border-rule bg-white/60 text-ink-soft'
                  }`}
                >
                  {pairs[rightIdx].right}
                </button>
              ))}
            </div>
          </div>
        )}
        {!allMatched && (
          <p className="mt-3 text-center font-mono text-[10px] text-ink-soft">
            {selectedLeft !== null ? 'Now select the matching item on the right' : 'Select an item on the left to start matching'}
          </p>
        )}
      </div>
    </div>
  )
}

function RevealBlock({ sections }: { sections: { title: string; content: string }[] }) {
  const [revealedCount, setRevealedCount] = useState(1)

  return (
    <div className="rounded-xl border border-rule bg-white/60 overflow-hidden">
      <div className="px-5 py-3 border-b border-rule bg-charcoal/5">
        <span className="font-mono text-[10px] tracking-[0.2em] text-ink-soft uppercase">Guided learning</span>
        <span className="ml-2 font-mono text-[10px] text-ink-soft">{revealedCount}/{sections.length}</span>
      </div>
      <div className="p-5 space-y-4">
        {sections.map((section, i) => {
          if (i >= revealedCount) return null
          return (
            <div
              key={i}
              className="animate-fadeIn"
              style={{ animationDelay: i === revealedCount - 1 ? '0.1s' : '0s' }}
            >
              <p className="font-mono text-[10px] tracking-[0.2em] text-sienna uppercase mb-1">{section.title}</p>
              <p className="font-mono text-sm text-ink-soft leading-relaxed">{section.content}</p>
            </div>
          )
        })}
      </div>
      {revealedCount < sections.length && (
        <div className="px-5 pb-4">
          <button
            type="button"
            onClick={() => setRevealedCount(prev => prev + 1)}
            className="flex items-center gap-2 rounded-lg bg-sienna/10 px-4 py-2 font-mono text-sm text-sienna transition hover:bg-sienna/20"
          >
            Continue
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
      {revealedCount === sections.length && (
        <div className="px-5 pb-4">
          <span className="font-mono text-xs text-sage flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg>
            Section complete
          </span>
        </div>
      )}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  )
}

function HighlightBlock({ text, definitions }: { text: string; definitions: Record<string, string> }) {
  const [activeTerm, setActiveTerm] = useState<string | null>(null)
  const termRef = useRef<HTMLButtonElement>(null)

  // Parse text and replace {term} with interactive spans
  const parts: { type: 'text' | 'term'; value: string }[] = []
  const regex = /\{([^}]+)\}/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, match.index) })
    }
    parts.push({ type: 'term', value: match[1] })
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) })
  }

  return (
    <div className="rounded-xl border border-rule bg-white/60 p-5">
      <div className="mb-3">
        <span className="font-mono text-[10px] tracking-[0.2em] text-ink-soft uppercase">Key concepts</span>
      </div>
      <p className="font-serif text-base text-ink leading-relaxed">
        {parts.map((part, i) => {
          if (part.type === 'text') return <span key={i}>{part.value}</span>
          const def = definitions[part.value]
          return (
            <span key={i} className="relative inline-block">
              <button
                type="button"
                ref={activeTerm === part.value ? termRef : undefined}
                onClick={() => setActiveTerm(activeTerm === part.value ? null : part.value)}
                className="border-b-2 border-sienna/40 text-sienna font-medium cursor-pointer transition-colors hover:border-sienna hover:text-sienna-dk"
              >
                {part.value}
              </button>
              {activeTerm === part.value && def && (
                <span className="absolute left-1/2 top-full z-20 mt-2 w-64 -translate-x-1/2 rounded-lg border border-rule bg-cream p-3 shadow-lg">
                  <span className="block font-mono text-[10px] tracking-[0.2em] text-sienna uppercase mb-1">{part.value}</span>
                  <span className="block font-mono text-xs text-ink-soft leading-relaxed">{def}</span>
                  <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-rule bg-cream" />
                </span>
              )}
            </span>
          )
        })}
      </p>
    </div>
  )
}

function ComparisonBlock({ before, after }: { before: { label: string; text: string }; after: { label: string; text: string } }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {/* Before */}
      <div className="rounded-xl border border-rosewood/20 bg-rosewood/5 p-5">
        <div className="flex items-center gap-2 mb-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-rosewood shrink-0">
            <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
          </svg>
          <span className="font-mono text-[10px] tracking-[0.2em] text-rosewood uppercase">{before.label}</span>
        </div>
        <p className="font-mono text-sm text-ink-soft leading-relaxed">{before.text}</p>
      </div>
      {/* After */}
      <div className="rounded-xl border border-sage/30 bg-sage/5 p-5">
        <div className="flex items-center gap-2 mb-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sage shrink-0">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" />
          </svg>
          <span className="font-mono text-[10px] tracking-[0.2em] text-sage uppercase">{after.label}</span>
        </div>
        <p className="font-mono text-sm text-ink-soft leading-relaxed">{after.text}</p>
      </div>
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
