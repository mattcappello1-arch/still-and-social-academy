'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/actions/auth'
import Image from 'next/image'

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
