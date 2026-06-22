import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { LogoutButton, MobileSidebarToggle, Sidebar } from '../../(dashboard)/components'

export default async function AdminLayout({
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
    .select('first_name, last_name, is_admin')
    .eq('id', user.id)
    .single()

  if (!staff?.is_admin) redirect('/passport')

  const displayName = staff
    ? `${staff.first_name} ${staff.last_name}`
    : user.email ?? 'Admin'

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-rule bg-charcoal lg:flex">
        <AdminSidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <Sidebar isAdmin={true}>
        <AdminSidebarContent />
      </Sidebar>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-rule bg-white/40 px-4 backdrop-blur-sm lg:px-6">
          <div className="flex items-center gap-3">
            <MobileSidebarToggle />
            <span className="font-mono text-xs tracking-wider text-ink-soft uppercase">
              Admin
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

function AdminSidebarContent() {
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
          Admin
        </span>
      </div>

      <nav className="flex-1 px-3 py-4">
        <div className="mb-6">
          <p className="mb-2 px-3 font-mono text-[10px] tracking-widest text-cream/40 uppercase">
            Admin
          </p>
          <AdminSidebarLink href="/admin" label="Overview" />
          <AdminSidebarLink href="/admin/staff" label="Staff" />
          <AdminSidebarLink href="/admin/training" label="Training Mgmt" />
          <AdminSidebarLink href="/admin/documents" label="Documents" />
        </div>

        <div>
          <p className="mb-2 px-3 font-mono text-[10px] tracking-widest text-cream/40 uppercase">
            Staff View
          </p>
          <AdminSidebarLink href="/passport" label="Passport" />
          <AdminSidebarLink href="/training" label="Training" />
          <AdminSidebarLink href="/profile" label="Profile" />
        </div>
      </nav>

      <div className="border-t border-white/10 px-5 py-3">
        <p className="font-mono text-[10px] tracking-wider text-cream/30 uppercase">
          Still & Social
        </p>
      </div>
    </>
  )
}

function AdminSidebarLink({
  href,
  label,
}: {
  href: string
  label: string
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2 font-mono text-sm text-cream/70 transition hover:bg-white/5 hover:text-cream"
    >
      {label}
    </a>
  )
}
