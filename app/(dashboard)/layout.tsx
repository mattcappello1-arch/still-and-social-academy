import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { LogoutButton, MobileSidebarToggle, Sidebar, SidebarLinkClient } from './components'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: staff } = await supabase
    .from('academy_staff')
    .select('first_name, last_name, role, is_admin')
    .eq('id', user.id)
    .single()

  const displayName = staff
    ? `${staff.first_name} ${staff.last_name}`
    : user.email ?? 'Staff'

  const isAdmin = staff?.is_admin ?? false

  return (
    <div className="flex min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-sienna focus:text-cream focus:px-4 focus:py-2 focus:rounded-lg"
      >
        Skip to main content
      </a>

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-rule bg-charcoal lg:flex">
        <SidebarContent isAdmin={isAdmin} />
      </aside>

      {/* Mobile sidebar overlay */}
      <Sidebar isAdmin={isAdmin}>
        <SidebarContent isAdmin={isAdmin} />
      </Sidebar>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-rule bg-white/40 px-4 backdrop-blur-sm lg:px-6">
          <div className="flex items-center gap-3">
            <MobileSidebarToggle />
            <span className="font-mono text-xs tracking-wider text-ink-soft uppercase">
              Academy
            </span>
          </div>

          <div className="flex items-center gap-4">
            <form action="/search" method="get" className="hidden sm:block" role="search">
              <label htmlFor="header-search" className="sr-only">Search</label>
              <input id="header-search" name="q" type="text" placeholder="Search..."
                className="w-40 rounded-lg border border-rule bg-cream/50 px-3 py-1.5 text-xs text-ink placeholder:text-oatmeal-dk outline-none transition focus:w-56 focus:border-sienna/30" />
            </form>
            <span className="font-mono text-sm text-ink">{displayName}</span>
            <LogoutButton />
          </div>
        </header>

        <main id="main-content" className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}

const SIDEBAR_ICONS: Record<string, string> = {
  home: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z',
  book: 'M4 19.5A2.5 2.5 0 016.5 17H20 M4 19.5A2.5 2.5 0 004 17V5a2 2 0 012-2h14v14H6.5',
  'book-open': 'M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z',
  file: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6',
  user: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 3a4 4 0 100 8 4 4 0 000-8',
  grid: 'M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z',
  users: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 3a4 4 0 100 8 4 4 0 000-8 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75',
  layers: 'M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5',
  files: 'M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9l-7-7z M13 2v7h7',
  pen: 'M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z',
  trending: 'M23 6l-9.5 9.5-5-5L1 18',
  clipboard: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  award: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  heart: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z',
  'bar-chart': 'M18 20V10M12 20V4M6 20v-6',
  folder: 'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z',
  map: 'M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z',
  'check-square': 'M9 11l3 3L22 4 M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11',
  'layout': 'M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z M4 9h16 M9 9v11',
}

function SidebarContent({ isAdmin }: { isAdmin: boolean }) {
  return (
    <>
      <div className="flex h-14 items-center gap-3 border-b border-white/10 px-5">
        <Image
          src="/stone-logo.svg"
          alt="Still & Social"
          width={28}
          height={28}
          className="invert opacity-80"
        />
        <span className="font-serif text-lg font-light tracking-wide text-cream">
          Academy
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto" role="navigation" aria-label="Main navigation">
        <SidebarLinkClient href="/passport" label="My Training" iconPath={SIDEBAR_ICONS.home} />
        <SidebarLinkClient href="/foundation" label="Foundation" iconPath={SIDEBAR_ICONS.star} />
        <SidebarLinkClient href="/training" label="Training" iconPath={SIDEBAR_ICONS.book} />
        <SidebarLinkClient href="/profile" label="Profile" iconPath={SIDEBAR_ICONS.user} />

        {isAdmin && (
          <>
            <div className="mt-6 mb-1 px-3">
              <p className="font-mono text-[10px] tracking-widest text-cream/40 uppercase">Admin</p>
            </div>
            <SidebarLinkClient href="/admin" label="Dashboard" iconPath={SIDEBAR_ICONS.grid} />
            <SidebarLinkClient href="/admin/staff" label="Staff" iconPath={SIDEBAR_ICONS.users} />
            <SidebarLinkClient href="/admin/training" label="Manage Training" iconPath={SIDEBAR_ICONS.layers} />
          </>
        )}
      </nav>

      <div className="border-t border-white/10 px-5 py-3">
        <p className="font-mono text-[10px] tracking-wider text-cream/30 uppercase">
          Still & Social
        </p>
      </div>
    </>
  )
}
