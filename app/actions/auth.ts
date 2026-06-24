'use server'

import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const redirectTo = (formData.get('redirect') as string) || '/passport'

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  redirect(redirectTo)
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function resetStaffPassword(staffId: string, newPassword: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Verify caller is admin
  const admin = await createAdminClient()
  const { data: callerStaff } = await admin
    .from('academy_staff')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!callerStaff?.is_admin) return { error: 'Not authorized' }

  const { error } = await admin.auth.admin.updateUserById(staffId, {
    password: newPassword,
  })

  if (error) return { error: error.message }
  return { success: true }
}

export async function acceptInvite(formData: FormData) {
  const password = formData.get('password') as string
  const invitationId = formData.get('invitation_id') as string

  const supabase = await createClient()
  const admin = await createAdminClient()

  // Update the user's password (they arrive via magic link, already authed)
  const { error: passwordError } = await supabase.auth.updateUser({
    password,
  })

  if (passwordError) {
    redirect(
      `/accept-invite?error=${encodeURIComponent(passwordError.message)}`
    )
  }

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?error=Session+expired')
  }

  // Fetch the invitation details
  const { data: invitation } = await admin
    .from('academy_invitations')
    .select('*')
    .eq('id', invitationId)
    .single()

  if (invitation) {
    // Create the staff record from invitation data
    await admin.from('academy_staff').upsert({
      id: user.id,
      email: user.email,
      first_name: invitation.first_name,
      last_name: invitation.last_name,
      role: invitation.role,
      employment_type: invitation.employment_type,
      status: 'active',
    })

    // Mark invitation as accepted
    await admin
      .from('academy_invitations')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', invitationId)
  }

  redirect('/passport')
}
