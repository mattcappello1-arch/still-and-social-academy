import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { LogoutButton, MobileSidebarToggle, Sidebar, AdminSidebarLinkClient, SidebarSection } from '../../(dashboard)/components'

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
            <form action="/admin/search" method="GET" className="hidden sm:block">
              <input
                type="text"
                name="q"
                placeholder="Search..."
                className="w-48 rounded-lg border border-rule bg-white/60 px-3 py-1.5 font-mono text-xs text-ink placeholder:text-ink-soft/50 focus:border-sienna/30 focus:outline-none focus:w-64 transition-all"
              />
            </form>
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

      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="mb-2">
          <AdminSidebarLinkClient href="/admin" label="Overview" />
        </div>

        <SidebarSection label="Learn" defaultOpen>
          <AdminSidebarLinkClient href="/admin/training" label="Training Mgmt" />
          <AdminSidebarLinkClient href="/admin/handbook" label="Handbook" />
          <AdminSidebarLinkClient href="/admin/resources" label="Resources" />
        </SidebarSection>

        <SidebarSection label="Operate">
          <AdminSidebarLinkClient href="/admin/readiness" label="Readiness" />
        </SidebarSection>

        <SidebarSection label="Comply">
          <AdminSidebarLinkClient href="/admin/certifications" label="Certifications" />
          <AdminSidebarLinkClient href="/admin/signing" label="Signing" />
          <AdminSidebarLinkClient href="/admin/signoffs" label="Sign-Offs" />
          <AdminSidebarLinkClient href="/admin/documents" label="Documents" />
        </SidebarSection>

        <SidebarSection label="People">
          <AdminSidebarLinkClient href="/admin/staff" label="Staff" />
          <AdminSidebarLinkClient href="/admin/recognition" label="Recognition" />
          <AdminSidebarLinkClient href="/admin/talent" label="Talent" />
        </SidebarSection>

        <SidebarSection label="Develop">
          <AdminSidebarLinkClient href="/admin/reviews" label="Reviews" />
          <AdminSidebarLinkClient href="/admin/wellbeing" label="Wellbeing" />
          <AdminSidebarLinkClient href="/admin/skills" label="Skills" />
        </SidebarSection>

        <SidebarSection label="Insights">
          <AdminSidebarLinkClient href="/admin/analytics" label="Analytics" />
          <AdminSidebarLinkClient href="/admin/search" label="Admin Search" />
        </SidebarSection>

        <SidebarSection label="Staff View">
          <AdminSidebarLinkClient href="/passport" label="Passport" />
          <AdminSidebarLinkClient href="/training" label="Training" />
          <AdminSidebarLinkClient href="/profile" label="Profile" />
        </SidebarSection>
      </nav>

      <div className="border-t border-white/10 px-5 py-3">
        <p className="font-mono text-[10px] tracking-wider text-cream/30 uppercase">
          Still & Social
        </p>
      </div>
    </>
  )
}
