export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl py-20 text-center">
      <h1 className="font-serif text-4xl font-light text-ink mb-4">Page not found</h1>
      <p className="text-sm text-ink-soft mb-6">The page you are looking for does not exist or has been moved.</p>
      <a
        href="/passport"
        className="rounded-lg bg-charcoal px-6 py-2.5 text-sm font-medium text-cream transition hover:bg-sienna"
      >
        Back to Passport
      </a>
    </div>
  )
}
