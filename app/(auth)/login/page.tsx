import { login } from '@/app/actions/auth'

const ERROR_MESSAGES: Record<string, string> = {
  'Invalid login credentials':
    'That email or password doesn\'t match our records. Please try again.',
  'Email not confirmed':
    'Your email hasn\'t been confirmed yet. Check your inbox for a verification link.',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirect?: string }>
}) {
  const params = await searchParams
  const error = params.error
  const redirect = params.redirect
  const friendlyError = error ? (ERROR_MESSAGES[error] ?? error) : null

  return (
    <div>
      <h2 className="mb-1 font-serif text-2xl font-light text-ink">
        Welcome to the Academy
      </h2>
      <p className="mb-6 font-mono text-sm text-ink-soft">
        Sign in to access your training and documents
      </p>

      {friendlyError && (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-sienna/20 bg-sienna/5 px-4 py-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mt-0.5 shrink-0 text-sienna">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          <p className="font-mono text-sm text-sienna">{friendlyError}</p>
        </div>
      )}

      <form action={login} className="space-y-4">
        {redirect && (
          <input type="hidden" name="redirect" value={redirect} />
        )}

        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block font-mono text-xs tracking-wider text-ink-soft uppercase"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-lg border border-rule bg-cream/50 px-4 py-2.5 font-mono text-sm text-ink placeholder:text-oatmeal-dk outline-none transition focus:border-sienna/40 focus:ring-1 focus:ring-sienna/20"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="password"
              className="block font-mono text-xs tracking-wider text-ink-soft uppercase"
            >
              Password
            </label>
            <ForgotPasswordLink />
          </div>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-rule bg-cream/50 px-4 py-2.5 font-mono text-sm text-ink placeholder:text-oatmeal-dk outline-none transition focus:border-sienna/40 focus:ring-1 focus:ring-sienna/20"
            placeholder="Your password"
          />
        </div>

        <button
          type="submit"
          className="mt-2 w-full rounded-lg bg-charcoal px-4 py-2.5 font-mono text-sm font-medium tracking-wide text-cream transition hover:bg-sienna active:scale-[0.98]"
        >
          Sign In
        </button>
      </form>
    </div>
  )
}

function ForgotPasswordLink() {
  return (
    <span className="group relative inline-block">
      <span className="cursor-help font-mono text-[10px] tracking-wide text-ink-soft transition hover:text-sienna">
        Forgot password?
      </span>
      <span className="pointer-events-none absolute right-0 top-full z-10 mt-2 w-56 rounded-lg border border-rule bg-white p-3 font-mono text-xs text-ink-soft shadow-lg opacity-0 transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto">
        Please contact your manager or admin to reset your password.
      </span>
    </span>
  )
}
