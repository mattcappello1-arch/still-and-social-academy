'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

/* ────────────────────────────────────────────
   Types
   ──────────────────────────────────────────── */

interface ReadAloudProps {
  moduleId: string
  blocks: Array<{ type: string; data: Record<string, unknown> }>
  onComplete?: () => void
  enabled?: boolean
  audioIntroUrl?: string
}

interface Section {
  id: number
  text: string
  label: string
}

interface SavedProgress {
  currentSection: number
  speed: number
  timestamp: string
}

/* ────────────────────────────────────────────
   Text extraction helpers
   ──────────────────────────────────────────── */

function stripHtml(html: string): string {
  if (typeof document !== 'undefined') {
    const div = document.createElement('div')
    div.innerHTML = html
    return div.textContent || div.innerText || ''
  }
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function extractSections(
  blocks: Array<{ type: string; data: Record<string, unknown> }>
): Section[] {
  return blocks
    .map((block, i) => {
      switch (block.type) {
        case 'text':
          return { id: i, text: stripHtml(block.data.html as string || ''), label: 'text' }
        case 'heading':
          return { id: i, text: block.data.text as string || '', label: 'heading' }
        case 'tip':
          return {
            id: i,
            text: `${(block.data.title as string) || 'Tip'}. ${block.data.text as string || ''}`,
            label: 'tip',
          }
        case 'quote': {
          const attr = block.data.attribution as string
          return {
            id: i,
            text: `${block.data.text as string || ''}${attr ? `. ${attr}` : ''}`,
            label: 'quote',
          }
        }
        case 'steps': {
          const items = (block.data.items as { title: string; description: string }[]) ?? []
          return {
            id: i,
            text: items.map((s, j) => `Step ${j + 1}: ${s.title}. ${s.description}`).join('. '),
            label: 'steps',
          }
        }
        case 'callout':
          return { id: i, text: block.data.text as string || '', label: 'callout' }
        case 'checklist': {
          const checkItems = (block.data.items as string[]) ?? []
          return { id: i, text: checkItems.join('. '), label: 'checklist' }
        }
        case 'accordion': {
          const accItems = (block.data.items as { title: string; content: string }[]) ?? []
          return {
            id: i,
            text: accItems.map((a) => `${a.title}. ${a.content}`).join('. '),
            label: 'accordion',
          }
        }
        case 'highlight':
          return {
            id: i,
            text: (block.data.text as string || '').replace(/\{([^}]+)\}/g, '$1'),
            label: 'highlight',
          }
        case 'comparison': {
          const before = block.data.before as { label: string; text: string } | undefined
          const after = block.data.after as { label: string; text: string } | undefined
          return {
            id: i,
            text: `${before?.label || 'Before'}: ${before?.text || ''}. ${after?.label || 'After'}: ${after?.text || ''}`,
            label: 'comparison',
          }
        }
        case 'scenario':
          return {
            id: i,
            text: block.data.situation as string || '',
            label: 'scenario',
          }
        case 'reveal': {
          const sections = (block.data.sections as { title: string; content: string }[]) ?? []
          return {
            id: i,
            text: sections.map((s) => `${s.title}. ${s.content}`).join('. '),
            label: 'reveal',
          }
        }
        case 'timeline': {
          const tlItems = (block.data.items as { time: string; title: string; description: string }[]) ?? []
          return {
            id: i,
            text: tlItems.map((t) => `${t.time}: ${t.title}. ${t.description}`).join('. '),
            label: 'timeline',
          }
        }
        case 'flipcards': {
          const cards = (block.data.items as { front: string; back: string }[]) ?? []
          return {
            id: i,
            text: cards.map((c) => `${c.front}. ${c.back}`).join('. '),
            label: 'flipcards',
          }
        }
        case 'matching': {
          const instruction = block.data.instruction as string || ''
          const pairs = (block.data.pairs as { left: string; right: string }[]) ?? []
          return {
            id: i,
            text: `${instruction}. ${pairs.map((p) => `${p.left} matches with ${p.right}`).join('. ')}`,
            label: 'matching',
          }
        }
        default:
          return null
      }
    })
    .filter((s): s is Section => s !== null && s.text.trim().length > 0)
}

/* ────────────────────────────────────────────
   localStorage helpers
   ──────────────────────────────────────────── */

function getStorageKey(moduleId: string) {
  return `academy_readaloud_${moduleId}`
}

function loadProgress(moduleId: string): SavedProgress | null {
  try {
    const raw = localStorage.getItem(getStorageKey(moduleId))
    if (!raw) return null
    return JSON.parse(raw) as SavedProgress
  } catch {
    return null
  }
}

function saveProgress(moduleId: string, section: number, speed: number) {
  try {
    const data: SavedProgress = {
      currentSection: section,
      speed,
      timestamp: new Date().toISOString(),
    }
    localStorage.setItem(getStorageKey(moduleId), JSON.stringify(data))
  } catch {
    // localStorage unavailable
  }
}

function clearProgress(moduleId: string) {
  try {
    localStorage.removeItem(getStorageKey(moduleId))
  } catch {
    // localStorage unavailable
  }
}

/* ────────────────────────────────────────────
   Main component
   ──────────────────────────────────────────── */

export function ReadAloud({
  moduleId,
  blocks,
  onComplete,
  enabled = true,
  audioIntroUrl,
}: ReadAloudProps) {
  const [sections] = useState<Section[]>(() => extractSections(blocks))
  const [currentSection, setCurrentSection] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [minimized, setMinimized] = useState(false)
  const [showResume, setShowResume] = useState(false)
  const [savedSection, setSavedSection] = useState(0)
  const [playingIntro, setPlayingIntro] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [supported, setSupported] = useState(true)

  const synthRef = useRef<SpeechSynthesis | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Check browser support & load saved progress
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setSupported(false)
      return
    }
    synthRef.current = window.speechSynthesis

    const saved = loadProgress(moduleId)
    if (saved && saved.currentSection > 0 && saved.currentSection < sections.length) {
      setSavedSection(saved.currentSection)
      setSpeed(saved.speed)
      setShowResume(true)
    }
  }, [moduleId, sections.length])

  // Highlight current block in DOM
  useEffect(() => {
    if (!isPlaying && !isPaused) {
      // Remove all highlights
      document.querySelectorAll('.reading-active').forEach((el) => {
        el.classList.remove('reading-active')
      })
      return
    }

    const section = sections[currentSection]
    if (!section) return

    // Remove old highlights
    document.querySelectorAll('.reading-active').forEach((el) => {
      el.classList.remove('reading-active')
    })

    // Add new highlight
    const el = document.querySelector(`[data-block-index="${section.id}"]`)
    if (el) {
      el.classList.add('reading-active')
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [currentSection, isPlaying, isPaused, sections])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel()
      }
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      document.querySelectorAll('.reading-active').forEach((el) => {
        el.classList.remove('reading-active')
      })
    }
  }, [])

  const speakSection = useCallback(
    (index: number) => {
      const synth = synthRef.current
      if (!synth || index >= sections.length) return

      synth.cancel()
      const section = sections[index]
      const utterance = new SpeechSynthesisUtterance(section.text)
      utterance.rate = speed
      utterance.lang = 'en-AU'

      utterance.onend = () => {
        const nextIndex = index + 1
        if (nextIndex < sections.length) {
          setCurrentSection(nextIndex)
          saveProgress(moduleId, nextIndex, speed)
          speakSection(nextIndex)
        } else {
          // All sections read
          setIsPlaying(false)
          setIsPaused(false)
          setCompleted(true)
          clearProgress(moduleId)
          onComplete?.()
        }
      }

      utterance.onerror = (e) => {
        if (e.error !== 'canceled') {
          setIsPlaying(false)
          setIsPaused(false)
        }
      }

      utteranceRef.current = utterance
      synth.speak(utterance)
    },
    [sections, speed, moduleId, onComplete]
  )

  const playIntroThenStart = useCallback(
    (startIndex: number) => {
      if (audioIntroUrl) {
        setPlayingIntro(true)
        const audio = new Audio(audioIntroUrl)
        audioRef.current = audio
        audio.onended = () => {
          setPlayingIntro(false)
          audioRef.current = null
          setCurrentSection(startIndex)
          speakSection(startIndex)
        }
        audio.onerror = () => {
          setPlayingIntro(false)
          audioRef.current = null
          setCurrentSection(startIndex)
          speakSection(startIndex)
        }
        audio.play().catch(() => {
          setPlayingIntro(false)
          audioRef.current = null
          setCurrentSection(startIndex)
          speakSection(startIndex)
        })
      } else {
        setCurrentSection(startIndex)
        speakSection(startIndex)
      }
    },
    [audioIntroUrl, speakSection]
  )

  const handlePlay = useCallback(() => {
    const synth = synthRef.current
    if (!synth) return

    if (isPaused) {
      synth.resume()
      setIsPaused(false)
      setIsPlaying(true)
      return
    }

    setIsPlaying(true)
    setIsPaused(false)
    setCompleted(false)
    playIntroThenStart(currentSection)
  }, [isPaused, currentSection, playIntroThenStart])

  const handlePause = useCallback(() => {
    const synth = synthRef.current
    if (!synth) return

    synth.pause()
    setIsPaused(true)
    setIsPlaying(false)
  }, [])

  const handleStop = useCallback(() => {
    const synth = synthRef.current
    if (!synth) return

    synth.cancel()
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setIsPlaying(false)
    setIsPaused(false)
    setPlayingIntro(false)
    saveProgress(moduleId, currentSection, speed)
  }, [moduleId, currentSection, speed])

  const handlePrev = useCallback(() => {
    const synth = synthRef.current
    if (!synth) return

    const prevIndex = Math.max(0, currentSection - 1)
    synth.cancel()
    setCurrentSection(prevIndex)
    if (isPlaying || isPaused) {
      setIsPaused(false)
      setIsPlaying(true)
      speakSection(prevIndex)
    }
  }, [currentSection, isPlaying, isPaused, speakSection])

  const handleNext = useCallback(() => {
    const synth = synthRef.current
    if (!synth) return

    const nextIndex = Math.min(sections.length - 1, currentSection + 1)
    synth.cancel()
    setCurrentSection(nextIndex)
    if (isPlaying || isPaused) {
      setIsPaused(false)
      setIsPlaying(true)
      speakSection(nextIndex)
    }
  }, [currentSection, sections.length, isPlaying, isPaused, speakSection])

  const handleReplay = useCallback(() => {
    const synth = synthRef.current
    if (!synth) return

    synth.cancel()
    setCurrentSection(0)
    setIsPlaying(true)
    setIsPaused(false)
    setCompleted(false)
    playIntroThenStart(0)
  }, [playIntroThenStart])

  const handleSpeedChange = useCallback(
    (newSpeed: number) => {
      setSpeed(newSpeed)
      const synth = synthRef.current
      if (!synth) return

      // If currently speaking, restart with new speed
      if (isPlaying) {
        synth.cancel()
        // Small delay to let cancel take effect
        setTimeout(() => {
          speakSection(currentSection)
        }, 50)
      }
    },
    [isPlaying, currentSection, speakSection]
  )

  const handleResume = useCallback(() => {
    setShowResume(false)
    setCurrentSection(savedSection)
    setIsPlaying(true)
    setCompleted(false)
    playIntroThenStart(savedSection)
  }, [savedSection, playIntroThenStart])

  const handleStartOver = useCallback(() => {
    setShowResume(false)
    setCurrentSection(0)
    clearProgress(moduleId)
  }, [moduleId])

  // Don't render if disabled, unsupported, or no sections
  if (!enabled || !supported || sections.length === 0) return null

  const progress =
    sections.length > 0
      ? Math.round(((currentSection + (isPlaying ? 0.5 : 0)) / sections.length) * 100)
      : 0

  const speeds = [1, 1.25, 1.5] as const

  return (
    <>
      {/* Resume prompt */}
      {showResume && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-sienna/20 bg-sienna/5 px-5 py-4">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="shrink-0 text-sienna"
          >
            <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
            <path d="M10 8l6 4-6 4V8z" />
          </svg>
          <p className="flex-1 font-mono text-sm text-ink-soft">
            You were listening to Section {savedSection + 1}. Resume?
          </p>
          <button
            type="button"
            onClick={handleResume}
            className="rounded-lg bg-sienna px-3 py-1.5 font-mono text-xs text-cream transition hover:bg-sienna-dk"
          >
            Resume
          </button>
          <button
            type="button"
            onClick={handleStartOver}
            className="rounded-lg border border-rule px-3 py-1.5 font-mono text-xs text-ink-soft transition hover:border-sienna/30"
          >
            Start Over
          </button>
        </div>
      )}

      {/* Completed message */}
      {completed && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-sage/30 bg-sage/5 px-5 py-4">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="shrink-0 text-sage"
          >
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
            <path d="M22 4L12 14.01l-3-3" />
          </svg>
          <p className="font-mono text-sm text-sage font-medium">
            Module listened in full
          </p>
        </div>
      )}

      {/* Player bar */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ${
          minimized ? 'translate-y-[calc(100%-44px)]' : 'translate-y-0'
        }`}
      >
        {/* Minimize toggle */}
        <div className="mx-auto flex max-w-3xl justify-end px-4">
          <button
            type="button"
            onClick={() => setMinimized(!minimized)}
            className="flex items-center gap-1.5 rounded-t-lg bg-charcoal px-3 py-1.5 font-mono text-[10px] text-cream/70 transition hover:text-cream"
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`transition-transform duration-300 ${minimized ? 'rotate-180' : ''}`}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
            {minimized ? 'Show Player' : 'Hide Player'}
          </button>
        </div>

        <div className="bg-charcoal shadow-[0_-4px_24px_rgba(0,0,0,0.2)]">
          <div className="mx-auto max-w-3xl px-4 py-3">
            {/* Top row: section info + speed */}
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="shrink-0 text-cream/70"
                >
                  <path d="M11 5L6 9H2v6h4l5 4V5z" />
                  <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
                </svg>
                <span className="font-mono text-xs text-cream/70">
                  {playingIntro
                    ? 'Playing intro...'
                    : `Section ${currentSection + 1} of ${sections.length}`}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {speeds.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSpeedChange(s)}
                    className={`rounded-md px-2 py-0.5 font-mono text-[10px] transition ${
                      speed === s
                        ? 'bg-sienna text-cream'
                        : 'text-cream/50 hover:text-cream/80'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-3 h-1 w-full overflow-hidden rounded-full bg-cream/10">
              <div
                className="h-full rounded-full bg-sienna transition-all duration-300"
                style={{ width: `${completed ? 100 : progress}%` }}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Previous */}
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentSection === 0 || playingIntro}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-cream/70 transition hover:bg-cream/10 hover:text-cream disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Previous section"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 20L9 12l10-8v16z" />
                    <path d="M5 19V5" />
                  </svg>
                </button>

                {/* Play / Pause */}
                {isPlaying ? (
                  <button
                    type="button"
                    onClick={handlePause}
                    disabled={playingIntro}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-cream text-charcoal transition hover:bg-cream-soft disabled:opacity-50"
                    title="Pause"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePlay}
                    disabled={playingIntro}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-cream text-charcoal transition hover:bg-cream-soft disabled:opacity-50"
                    title={isPaused ? 'Resume' : 'Play'}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                )}

                {/* Stop */}
                <button
                  type="button"
                  onClick={handleStop}
                  disabled={!isPlaying && !isPaused}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-cream/70 transition hover:bg-cream/10 hover:text-cream disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Stop"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="4" y="4" width="16" height="16" rx="2" />
                  </svg>
                </button>

                {/* Next */}
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={currentSection >= sections.length - 1 || playingIntro}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-cream/70 transition hover:bg-cream/10 hover:text-cream disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Next section"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 4l10 8-10 8V4z" />
                    <path d="M19 5v14" />
                  </svg>
                </button>

                {/* Replay */}
                {completed && (
                  <button
                    type="button"
                    onClick={handleReplay}
                    className="ml-2 flex items-center gap-1.5 rounded-lg bg-cream/10 px-3 py-1.5 font-mono text-[10px] text-cream/70 transition hover:bg-cream/20 hover:text-cream"
                    title="Replay from start"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 4v6h6" />
                      <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
                    </svg>
                    Replay
                  </button>
                )}
              </div>

              {/* Section label */}
              <span className="font-mono text-[10px] text-cream/40 hidden sm:block">
                {sections[currentSection]?.label || ''}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
