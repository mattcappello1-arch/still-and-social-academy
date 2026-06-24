import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Verify admin
  const { data: currentStaff } = await supabase
    .from('academy_staff')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!currentStaff?.is_admin) {
    return new Response('Forbidden', { status: 403 })
  }

  // Use admin client to get all staff data
  const admin = await createAdminClient()

  const { data: staff } = await admin
    .from('academy_staff')
    .select('id, first_name, last_name, email, phone, role, department, status, start_date, employment_type')
    .order('first_name')

  if (!staff) {
    return new Response('No staff data', { status: 500 })
  }

  // Get training progress for each staff member
  const { data: allPaths } = await admin
    .from('academy_training_paths')
    .select('id')
    .eq('is_active', true)

  const { data: allModules } = await admin
    .from('academy_training_modules')
    .select('id, path_id')
    .eq('is_active', true)

  const { data: allProgress } = await admin
    .from('academy_staff_module_progress')
    .select('staff_id, module_id, status')
    .eq('status', 'completed')

  const totalModuleCount = allModules?.length ?? 0

  // Build a map: staffId -> completed module count
  const completedByStaff = new Map<string, number>()
  for (const p of allProgress ?? []) {
    completedByStaff.set(p.staff_id, (completedByStaff.get(p.staff_id) ?? 0) + 1)
  }

  // Build CSV
  const headers = ['Name', 'Email', 'Phone', 'Role', 'Department', 'Status', 'Start Date', 'Employment Type', 'Training %']
  const rows = staff.map((s) => {
    const completed = completedByStaff.get(s.id) ?? 0
    const trainingPercent = totalModuleCount > 0
      ? Math.round((completed / totalModuleCount) * 100)
      : 0

    return [
      `${s.first_name} ${s.last_name}`,
      s.email,
      s.phone ?? '',
      s.role,
      s.department,
      s.status,
      s.start_date ?? '',
      s.employment_type ?? '',
      `${trainingPercent}%`,
    ]
  })

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => {
        // Escape cells that contain commas or quotes
        const str = String(cell)
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`
        }
        return str
      }).join(',')
    ),
  ].join('\n')

  return new Response(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="staff-export.csv"',
    },
  })
}
