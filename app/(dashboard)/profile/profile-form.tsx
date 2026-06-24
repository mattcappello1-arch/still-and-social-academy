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
      {/* Success/Error toast */}
      {saved && (
        <div className="flex items-center gap-3 rounded-lg border border-sage/20 bg-sage/5 px-4 py-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-sage shrink-0"><path d="M20 6L9 17l-5-5" /></svg>
          <p className="font-mono text-sm text-sage">Your changes have been saved successfully.</p>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-rosewood/20 bg-rosewood/5 px-4 py-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-rosewood shrink-0"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
          <p className="font-mono text-sm text-rosewood">{error}</p>
        </div>
      )}

      {/* Personal Details */}
      <Section title="Personal Details" description="Your contact information and date of birth">
        <Field label="Phone" name="phone" defaultValue={phone} required placeholder="0412 345 678" />
        <Field
          label="Date of Birth"
          name="date_of_birth"
          type="date"
          defaultValue={d?.date_of_birth ?? ''}
          required
        />
      </Section>

      {/* Address */}
      <Section title="Address" description="Your current residential address">
        <Field
          label="Address Line 1"
          name="address_line_1"
          defaultValue={d?.address_line_1 ?? ''}
          required
          placeholder="123 Example Street"
        />
        <Field
          label="Address Line 2"
          name="address_line_2"
          defaultValue={d?.address_line_2 ?? ''}
          placeholder="Unit, apartment, etc. (optional)"
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <Field
            label="Suburb"
            name="suburb"
            defaultValue={d?.suburb ?? ''}
            required
            placeholder="Melbourne"
          />
          <Field label="State" name="state" defaultValue={d?.state ?? ''} required placeholder="VIC" />
          <Field
            label="Postcode"
            name="postcode"
            defaultValue={d?.postcode ?? ''}
            required
            placeholder="3000"
          />
        </div>
      </Section>

      {/* Emergency Contact */}
      <Section title="Emergency Contact" description="Someone we can reach in case of an emergency">
        <Field
          label="Full Name"
          name="emergency_contact_name"
          defaultValue={d?.emergency_contact_name ?? ''}
          required
          placeholder="Jane Doe"
        />
        <Field
          label="Phone Number"
          name="emergency_contact_phone"
          defaultValue={d?.emergency_contact_phone ?? ''}
          required
          placeholder="0412 345 678"
        />
        <Field
          label="Relationship"
          name="emergency_contact_relationship"
          defaultValue={d?.emergency_contact_relationship ?? ''}
          required
          placeholder="e.g. Partner, Parent, Sibling"
        />
      </Section>

      {/* Bank Details */}
      <Section title="Bank Details" description="For payroll purposes. Your details are stored securely.">
        <Field
          label="Account Name"
          name="bank_account_name"
          defaultValue={d?.bank_account_name ?? ''}
          required
          placeholder="Your name as it appears on the account"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="BSB"
            name="bank_bsb"
            defaultValue={d?.bank_bsb ?? ''}
            required
            placeholder="000-000"
          />
          <Field
            label="Account Number"
            name="bank_account_number"
            defaultValue={d?.bank_account_number ?? ''}
            required
            placeholder="12345678"
          />
        </div>
      </Section>

      {/* Super */}
      <Section title="Superannuation" description="Your super fund details for employer contributions">
        <Field
          label="Fund Name"
          name="super_fund_name"
          defaultValue={d?.super_fund_name ?? ''}
          required
          placeholder="e.g. Australian Super"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Member Number"
            name="super_member_number"
            defaultValue={d?.super_member_number ?? ''}
            required
            placeholder="Your member number"
          />
          <Field
            label="USI"
            name="super_usi"
            defaultValue={d?.super_usi ?? ''}
            placeholder="Unique Superannuation Identifier (optional)"
          />
        </div>
      </Section>

      {/* Tax */}
      <Section title="Tax" description="Your tax file number for payroll">
        <Field
          label="Tax File Number"
          name="tax_file_number"
          defaultValue={d?.tax_file_number ?? ''}
          required
          placeholder="123 456 789"
        />
      </Section>

      {/* Save */}
      <div className="sticky bottom-0 -mx-4 border-t border-rule bg-cream/95 px-4 py-4 backdrop-blur-sm lg:-mx-8 lg:px-8">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-sienna px-6 py-2.5 font-mono text-sm font-medium tracking-wide text-cream transition hover:bg-sienna/90 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-rule bg-white/60 p-6">
      <div className="mb-4">
        <h3 className="font-serif text-lg font-light text-ink">{title}</h3>
        {description && (
          <p className="mt-0.5 font-mono text-xs text-ink-soft">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function Field({
  label,
  name,
  defaultValue,
  type = 'text',
  required,
  placeholder,
}: {
  label: string
  name: string
  defaultValue?: string
  type?: string
  required?: boolean
  placeholder?: string
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1 flex items-center gap-1 font-mono text-xs text-ink-soft"
      >
        {label}
        {required && <span className="text-sienna">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-lg border border-rule bg-white px-3 py-2 font-mono text-sm text-ink placeholder:text-oatmeal-dk/60 outline-none transition focus:border-sienna/40 focus:ring-1 focus:ring-sienna/20"
      />
    </div>
  )
}
