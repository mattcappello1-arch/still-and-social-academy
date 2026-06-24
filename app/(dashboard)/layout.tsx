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
            <span className="font-mono text-sm text-ink">{displayName}</span>
            <LogoutButton />
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}

const SIDEBAR_ICONS: Record<string, string> = {
  home: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z',
  book: 'M4 19.5A2.5 2.5 0 016.5 17H20 M4 19.5A2.5 2.5 0 004 17V5a2 2 0 012-2h14v14H6.5',
  file: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6',
  user: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 3a4 4 0 100 8 4 4 0 000-8',
  grid: 'M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z',
  users: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 3a4 4 0 100 8 4 4 0 000-8 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75',
  layers: 'M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5',
  files: 'M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9l-7-7z M13 2v7h7',
  pen: 'M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z',
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

      <nav className="flex-1 px-3 py-4">
        <div className="mb-6">
          <p className="mb-2 px-3 font-mono text-[10px] tracking-widest text-cream/40 uppercase">
            Your Space
          </p>
          <SidebarLinkClient href="/passport" label="Passport" iconPath={SIDEBAR_ICONS.home} />
          <SidebarLinkClient href="/training" label="Training" iconPath={SIDEBAR_ICONS.book} />
          <SidebarLinkClient href="/documents" label="Documents" iconPath={SIDEBAR_ICONS.file} />
          <SidebarLinkClient href="/profile" label="Profile" iconPath={SIDEBAR_ICONS.user} />
        </div>

        {isAdmin && (
          <div>
            <p className="mb-2 px-3 font-mono text-[10px] tracking-widest text-cream/40 uppercase">
              Admin
            </p>
            <SidebarLinkClient href="/admin" label="Overview" iconPath={SIDEBAR_ICONS.grid} />
            <SidebarLinkClient href="/admin/staff" label="Staff" iconPath={SIDEBAR_ICONS.users} />
            <SidebarLinkClient href="/admin/training" label="Training Mgmt" iconPath={SIDEBAR_ICONS.layers} />
            <SidebarLinkClient href="/admin/documents" label="Documents" iconPath={SIDEBAR_ICONS.files} />
            <SidebarLinkClient href="/admin/signing" label="Signing" iconPath={SIDEBAR_ICONS.pen} />
          </div>
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
