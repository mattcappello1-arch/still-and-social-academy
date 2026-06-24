'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/actions/auth'
import Image from 'next/image'

export function SidebarSection({ label, icon, children, defaultOpen }: {
  label: string
  icon?: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const pathname = usePathname()
  const contentRef = useRef<HTMLDivElement>(null)

  // Check if any child link matches the current path
  const childrenArray = Array.isArray(children) ? children : [children]
  const hasActiveChild = childrenArray.some((child: any) => {
    if (!child?.props?.href) return false
    const href = child.props.href
    return href === pathname || (href !== '/' && pathname.startsWith(href))
  })

  const storageKey = `sidebar-section-${label}`

  const [isOpen, setIsOpen] = useState(() => {
    if (hasActiveChild) return true
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey)
      if (stored !== null) return stored === 'true'
    }
    return defaultOpen ?? false
  })

  // Auto-expand when a child route becomes active
  useEffect(() => {
    if (hasActiveChild && !isOpen) {
      setIsOpen(true)
    }
  }, [hasActiveChild]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, String(isOpen))
    }
  }, [isOpen, storageKey])

  return (
    <div className="mb-2">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-3 py-1.5 group"
      >
        <span className="font-mono text-[10px] tracking-widest text-cream/40 uppercase">
          {label}
        </span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-cream/30 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
      <div
        style={{
          display: 'grid',
          gridTemplateRows: isOpen ? '1fr' : '0fr',
          transition: 'grid-template-rows 200ms ease',
        }}
      >
        <div className="overflow-hidden">
          <div ref={contentRef} className="py-0.5">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="rounded-lg border border-rule px-3 py-1.5 font-mono text-xs tracking-wide text-ink-soft transition hover:border-sienna/30 hover:text-sienna"
      >
        Sign Out
      </button>
    </form>
  )
}

export function MobileSidebarToggle() {
  return (
    <button
      type="button"
      aria-label="Toggle navigation menu"
      className="rounded-lg p-1.5 text-ink-soft transition hover:bg-rule lg:hidden"
      onClick={() => {
        document.getElementById('mobile-sidebar')?.classList.toggle('hidden')
      }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      >
        <path d="M3 12h18M3 6h18M3 18h18" />
      </svg>
    </button>
  )
}

export function Sidebar({
  isAdmin,
  children,
}: {
  isAdmin: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile trigger — hoisted from MobileSidebarToggle for this component */}
      <div
        id="mobile-sidebar"
        className={`fixed inset-0 z-50 lg:hidden ${open ? '' : 'hidden'}`}
      >
        <div
          className="absolute inset-0 bg-charcoal/60"
          onClick={() => {
            document.getElementById('mobile-sidebar')?.classList.add('hidden')
          }}
        />
        <aside className="relative flex h-full w-64 flex-col bg-charcoal shadow-xl">
          {children}
        </aside>
      </div>
    </>
  )
}

export function SidebarLinkClient({
  href,
  label,
  iconPath,
}: {
  href: string
  label: string
  iconPath: string
}) {
  const pathname = usePathname()
  const isActive =
    href === '/passport'
      ? pathname === '/passport'
      : href === '/admin'
        ? pathname === '/admin'
        : pathname.startsWith(href)

  return (
    <a
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 font-mono text-sm transition ${
        isActive
          ? 'bg-white/10 text-cream font-medium'
          : 'text-cream/70 hover:bg-white/5 hover:text-cream'
      }`}
    >
      {iconPath && (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0"
          aria-hidden="true"
        >
          <path d={iconPath} />
        </svg>
      )}
      {label}
    </a>
  )
}

export function AdminSidebarLinkClient({
  href,
  label,
}: {
  href: string
  label: string
}) {
  const pathname = usePathname()
  const isActive =
    href === '/admin'
      ? pathname === '/admin'
      : href === '/passport'
        ? pathname === '/passport'
        : pathname.startsWith(href)

  return (
    <a
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 font-mono text-sm transition ${
        isActive
          ? 'bg-white/10 text-cream font-medium'
          : 'text-cream/70 hover:bg-white/5 hover:text-cream'
      }`}
    >
      {label}
    </a>
  )
}
