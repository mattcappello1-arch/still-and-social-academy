import { acceptInvite } from '@/app/actions/auth'

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ invitation_id?: string; error?: string }>
}) {
  const params = await searchParams
  const invitationId = params.invitation_id
  const error = params.error

  return (
    <div>
      <h2 className="mb-1 font-serif text-2xl font-light text-ink">
        Set Your Password
      </h2>
      <p className="mb-6 font-mono text-sm text-ink-soft">
        Welcome to the team. Create a password to get started.
      </p>

      {error && (
        <div className="mb-4 rounded-lg border border-sienna/20 bg-sienna/5 px-4 py-3 font-mono text-sm text-sienna">
          {error}
        </div>
      )}

      <form action={acceptInvite} className="space-y-4">
        {invitationId && (
          <input type="hidden" name="invitation_id" value={invitationId} />
        )}

        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block font-mono text-xs tracking-wider text-ink-soft uppercase"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-lg border border-rule bg-cream/50 px-4 py-2.5 font-mono text-sm text-ink placeholder:text-oatmeal-dk outline-none transition focus:border-sienna/40 focus:ring-1 focus:ring-sienna/20"
            placeholder="At least 8 characters"
          />
        </div>

        <div>
          <label
            htmlFor="confirm_password"
            className="mb-1.5 block font-mono text-xs tracking-wider text-ink-soft uppercase"
          >
            Confirm Password
          </label>
          <input
            id="confirm_password"
            name="confirm_password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-lg border border-rule bg-cream/50 px-4 py-2.5 font-mono text-sm text-ink placeholder:text-oatmeal-dk outline-none transition focus:border-sienna/40 focus:ring-1 focus:ring-sienna/20"
            placeholder="Confirm your password"
          />
        </div>

        <button
          type="submit"
          className="mt-2 w-full rounded-lg bg-charcoal px-4 py-2.5 font-mono text-sm font-medium tracking-wide text-cream transition hover:bg-sienna active:scale-[0.98]"
        >
          Create Account
        </button>
      </form>
    </div>
  )
}
