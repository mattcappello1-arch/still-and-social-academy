import { login } from '@/app/actions/auth'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirect?: string }>
}) {
  const params = await searchParams
  const error = params.error
  const redirect = params.redirect

  return (
    <div>
      <h2 className="mb-1 font-serif text-2xl font-light text-ink">
        Welcome back
      </h2>
      <p className="mb-6 font-mono text-sm text-ink-soft">
        Sign in to your academy account
      </p>

      {error && (
        <div className="mb-4 rounded-lg border border-sienna/20 bg-sienna/5 px-4 py-3 font-mono text-sm text-sienna">
          {error}
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
