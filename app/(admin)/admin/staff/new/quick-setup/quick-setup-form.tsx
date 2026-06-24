'use client'

import { useState } from 'react'

interface SigningTemplate {
  id: string
  title: string
  doc_type: string
}

export function QuickSetupForm({
  roles,
  getRoleLabel,
  signingTemplates,
  quickSetupAction,
}: {
  roles: string[]
  getRoleLabel: (role: any) => string
  signingTemplates: SigningTemplate[]
  quickSetupAction: (formData: FormData) => Promise<void>
}) {
  const [step, setStep] = useState(1)
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([])

  const toggleTemplate = (id: string) => {
    setSelectedTemplates((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    )
  }

  const totalSteps = 3

  return (
    <form action={quickSetupAction} className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center gap-3 mb-6">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full font-mono text-xs ${
                i + 1 === step
                  ? 'bg-sienna text-cream'
                  : i + 1 < step
                    ? 'bg-sage/20 text-sage-deep'
                    : 'border border-rule text-ink-soft'
              }`}
            >
              {i + 1 < step ? '\u2713' : i + 1}
            </div>
            <span className={`font-mono text-xs ${i + 1 === step ? 'text-ink' : 'text-ink-soft'}`}>
              {i === 0 ? 'Details' : i === 1 ? 'Documents' : 'Review'}
            </span>
            {i < totalSteps - 1 && (
              <div className={`mx-1 h-px w-8 ${i + 1 < step ? 'bg-sage' : 'bg-rule'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Staff details */}
      <div className={step === 1 ? '' : 'hidden'}>
        <div className="rounded-xl border border-rule bg-white/60 p-6 space-y-5">
          <h2 className="font-serif text-xl font-light text-ink">Staff Details</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="first_name" className="mb-1.5 block font-mono text-xs tracking-wider text-ink-soft uppercase">
                First Name
              </label>
              <input id="first_name" name="first_name" type="text" required
                className="w-full rounded-lg border border-rule bg-cream/50 px-4 py-2.5 font-mono text-sm text-ink placeholder:text-oatmeal-dk outline-none transition focus:border-sienna/40 focus:ring-1 focus:ring-sienna/20"
                placeholder="First name" />
            </div>
            <div>
              <label htmlFor="last_name" className="mb-1.5 block font-mono text-xs tracking-wider text-ink-soft uppercase">
                Last Name
              </label>
              <input id="last_name" name="last_name" type="text" required
                className="w-full rounded-lg border border-rule bg-cream/50 px-4 py-2.5 font-mono text-sm text-ink placeholder:text-oatmeal-dk outline-none transition focus:border-sienna/40 focus:ring-1 focus:ring-sienna/20"
                placeholder="Last name" />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block font-mono text-xs tracking-wider text-ink-soft uppercase">
              Email
            </label>
            <input id="email" name="email" type="email" required
              className="w-full rounded-lg border border-rule bg-cream/50 px-4 py-2.5 font-mono text-sm text-ink placeholder:text-oatmeal-dk outline-none transition focus:border-sienna/40 focus:ring-1 focus:ring-sienna/20"
              placeholder="staff@example.com" />
          </div>

          <div>
            <label htmlFor="role" className="mb-1.5 block font-mono text-xs tracking-wider text-ink-soft uppercase">
              Role
            </label>
            <select id="role" name="role" required
              className="w-full rounded-lg border border-rule bg-cream/50 px-4 py-2.5 font-mono text-sm text-ink outline-none transition focus:border-sienna/40 focus:ring-1 focus:ring-sienna/20">
              <option value="">Select a role</option>
              {roles.map((role) => (
                <option key={role} value={role}>{getRoleLabel(role)}</option>
              ))}
            </select>
            <p className="mt-1 font-mono text-[10px] text-ink-soft">Training paths are auto-assigned based on role.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="employment_type" className="mb-1.5 block font-mono text-xs tracking-wider text-ink-soft uppercase">
                Employment Type
              </label>
              <select id="employment_type" name="employment_type" required
                className="w-full rounded-lg border border-rule bg-cream/50 px-4 py-2.5 font-mono text-sm text-ink outline-none transition focus:border-sienna/40 focus:ring-1 focus:ring-sienna/20">
                <option value="">Select type</option>
                <option value="casual">Casual</option>
                <option value="part_time">Part-Time</option>
                <option value="full_time">Full-Time</option>
              </select>
            </div>
            <div>
              <label htmlFor="start_date" className="mb-1.5 block font-mono text-xs tracking-wider text-ink-soft uppercase">
                Start Date
              </label>
              <input id="start_date" name="start_date" type="date"
                className="w-full rounded-lg border border-rule bg-cream/50 px-4 py-2.5 font-mono text-sm text-ink outline-none transition focus:border-sienna/40 focus:ring-1 focus:ring-sienna/20" />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button type="button" onClick={() => setStep(2)}
            className="rounded-lg bg-charcoal px-6 py-2.5 font-mono text-sm font-medium tracking-wide text-cream transition hover:bg-sienna">
            Next: Documents
          </button>
        </div>
      </div>

      {/* Step 2: Select documents to send */}
      <div className={step === 2 ? '' : 'hidden'}>
        <div className="rounded-xl border border-rule bg-white/60 p-6 space-y-4">
          <h2 className="font-serif text-xl font-light text-ink">Documents to Send</h2>
          <p className="font-mono text-xs text-ink-soft">Select documents to send for signing. These will be created and assigned automatically.</p>

          {signingTemplates.length === 0 ? (
            <p className="text-sm text-ink-soft">No signing templates available.</p>
          ) : (
            <div className="space-y-2">
              {signingTemplates.map((t) => (
                <label
                  key={t.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition ${
                    selectedTemplates.includes(t.id)
                      ? 'border-sienna/40 bg-sienna/5'
                      : 'border-rule hover:border-oatmeal-dk/30'
                  }`}
                >
                  <input
                    type="checkbox"
                    name="template_ids"
                    value={t.id}
                    checked={selectedTemplates.includes(t.id)}
                    onChange={() => toggleTemplate(t.id)}
                    className="h-4 w-4 rounded border-rule text-sienna accent-sienna"
                  />
                  <div>
                    <span className="font-mono text-sm text-ink">{t.title}</span>
                    <span className="block font-mono text-[10px] text-ink-soft">{t.doc_type}</span>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button type="button" onClick={() => setStep(1)}
            className="rounded-lg border border-rule px-4 py-2.5 font-mono text-sm text-ink-soft transition hover:bg-cream-soft">
            Back
          </button>
          <button type="button" onClick={() => setStep(3)}
            className="rounded-lg bg-charcoal px-6 py-2.5 font-mono text-sm font-medium tracking-wide text-cream transition hover:bg-sienna">
            Next: Review
          </button>
        </div>
      </div>

      {/* Step 3: Review and submit */}
      <div className={step === 3 ? '' : 'hidden'}>
        <div className="rounded-xl border border-rule bg-white/60 p-6 space-y-4">
          <h2 className="font-serif text-xl font-light text-ink">Review and Send</h2>

          <div className="rounded-lg bg-cream-soft/50 border border-rule p-4 space-y-3">
            <div>
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-soft">What will happen</p>
            </div>
            <ul className="space-y-2 text-sm text-ink">
              <li className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sienna/10 text-sienna text-xs">1</span>
                Staff account will be created with the details provided
              </li>
              <li className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sienna/10 text-sienna text-xs">2</span>
                Training paths will be auto-assigned based on role
              </li>
              {selectedTemplates.length > 0 && (
                <li className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sienna/10 text-sienna text-xs">3</span>
                  {selectedTemplates.length} document{selectedTemplates.length !== 1 ? 's' : ''} will be sent for signing
                </li>
              )}
              <li className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sienna/10 text-sienna text-xs">{selectedTemplates.length > 0 ? '4' : '3'}</span>
                Invitation email will be sent to the staff member
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button type="button" onClick={() => setStep(2)}
            className="rounded-lg border border-rule px-4 py-2.5 font-mono text-sm text-ink-soft transition hover:bg-cream-soft">
            Back
          </button>
          <button type="submit"
            className="rounded-lg bg-sienna px-6 py-2.5 font-mono text-sm font-medium tracking-wide text-cream transition hover:bg-sienna/90 active:scale-[0.98]">
            Create Staff and Send Invitation
          </button>
        </div>
      </div>
    </form>
  )
}
