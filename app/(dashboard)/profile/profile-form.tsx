'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface PersonalDetails {
  date_of_birth?: string | null
  address_line_1?: string | null
  address_line_2?: string | null
  suburb?: string | null
  state?: string | null
  postcode?: string | null
  emergency_contact_name?: string | null
  emergency_contact_phone?: string | null
  emergency_contact_relationship?: string | null
  bank_bsb?: string | null
  bank_account_number?: string | null
  bank_account_name?: string | null
  super_fund_name?: string | null
  super_member_number?: string | null
  super_usi?: string | null
  tax_file_number?: string | null
}

export function ProfileForm({
  staffId,
  phone,
  personalDetails,
}: {
  staffId: string
  phone: string
  personalDetails: PersonalDetails | null
}) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)

    const form = new FormData(e.currentTarget)
    const supabase = createClient()

    // Update phone on staff record
    const phoneVal = form.get('phone') as string
    await supabase
      .from('academy_staff')
      .update({ phone: phoneVal })
      .eq('id', staffId)

    // Upsert personal details
    const details = {
      staff_id: staffId,
      date_of_birth: (form.get('date_of_birth') as string) || null,
      address_line_1: (form.get('address_line_1') as string) || null,
      address_line_2: (form.get('address_line_2') as string) || null,
      suburb: (form.get('suburb') as string) || null,
      state: (form.get('state') as string) || null,
      postcode: (form.get('postcode') as string) || null,
      emergency_contact_name:
        (form.get('emergency_contact_name') as string) || null,
      emergency_contact_phone:
        (form.get('emergency_contact_phone') as string) || null,
      emergency_contact_relationship:
        (form.get('emergency_contact_relationship') as string) || null,
      bank_bsb: (form.get('bank_bsb') as string) || null,
      bank_account_number:
        (form.get('bank_account_number') as string) || null,
      bank_account_name: (form.get('bank_account_name') as string) || null,
      super_fund_name: (form.get('super_fund_name') as string) || null,
      super_member_number:
        (form.get('super_member_number') as string) || null,
      super_usi: (form.get('super_usi') as string) || null,
      tax_file_number: (form.get('tax_file_number') as string) || null,
    }

    const { error: upsertError } = await supabase
      .from('academy_staff_personal_details')
      .upsert(details, { onConflict: 'staff_id' })

    if (upsertError) {
      setError(upsertError.message)
    } else {
      setSaved(true)
      router.refresh()
    }

    setSaving(false)
  }

  const d = personalDetails

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Contact */}
      <Section title="Contact">
        <Field label="Phone" name="phone" defaultValue={phone} />
        <Field
          label="Date of Birth"
          name="date_of_birth"
          type="date"
          defaultValue={d?.date_of_birth ?? ''}
        />
      </Section>

      {/* Address */}
      <Section title="Address">
        <Field
          label="Address Line 1"
          name="address_line_1"
          defaultValue={d?.address_line_1 ?? ''}
        />
        <Field
          label="Address Line 2"
          name="address_line_2"
          defaultValue={d?.address_line_2 ?? ''}
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <Field
            label="Suburb"
            name="suburb"
            defaultValue={d?.suburb ?? ''}
          />
          <Field label="State" name="state" defaultValue={d?.state ?? ''} />
          <Field
            label="Postcode"
            name="postcode"
            defaultValue={d?.postcode ?? ''}
          />
        </div>
      </Section>

      {/* Emergency Contact */}
      <Section title="Emergency Contact">
        <Field
          label="Name"
          name="emergency_contact_name"
          defaultValue={d?.emergency_contact_name ?? ''}
        />
        <Field
          label="Phone"
          name="emergency_contact_phone"
          defaultValue={d?.emergency_contact_phone ?? ''}
        />
        <Field
          label="Relationship"
          name="emergency_contact_relationship"
          defaultValue={d?.emergency_contact_relationship ?? ''}
        />
      </Section>

      {/* Bank Details */}
      <Section title="Bank Details">
        <Field
          label="Account Name"
          name="bank_account_name"
          defaultValue={d?.bank_account_name ?? ''}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="BSB"
            name="bank_bsb"
            defaultValue={d?.bank_bsb ?? ''}
          />
          <Field
            label="Account Number"
            name="bank_account_number"
            defaultValue={d?.bank_account_number ?? ''}
          />
        </div>
      </Section>

      {/* Super */}
      <Section title="Superannuation">
        <Field
          label="Fund Name"
          name="super_fund_name"
          defaultValue={d?.super_fund_name ?? ''}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Member Number"
            name="super_member_number"
            defaultValue={d?.super_member_number ?? ''}
          />
          <Field
            label="USI"
            name="super_usi"
            defaultValue={d?.super_usi ?? ''}
          />
        </div>
      </Section>

      {/* Tax */}
      <Section title="Tax">
        <Field
          label="Tax File Number"
          name="tax_file_number"
          defaultValue={d?.tax_file_number ?? ''}
        />
      </Section>

      {/* Save */}
      <div className="flex items-center gap-4 border-t border-rule pt-6">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-sienna px-6 py-2.5 font-mono text-sm font-medium tracking-wide text-cream transition hover:bg-sienna/90 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        {saved && (
          <p className="font-mono text-sm text-sage">Changes saved.</p>
        )}
        {error && (
          <p className="font-mono text-sm text-rosewood">{error}</p>
        )}
      </div>
    </form>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-rule bg-white/60 p-6">
      <p className="mb-4 font-mono text-[10px] tracking-widest text-ink-soft uppercase">
        {title}
      </p>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function Field({
  label,
  name,
  defaultValue,
  type = 'text',
}: {
  label: string
  name: string
  defaultValue?: string
  type?: string
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1 block font-mono text-xs text-ink-soft"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-rule bg-white px-3 py-2 font-mono text-sm text-ink outline-none transition focus:border-sienna/40 focus:ring-1 focus:ring-sienna/20"
      />
    </div>
  )
}
