import Image from 'next/image'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <Image
            src="/stone-logo.svg"
            alt="Still & Social"
            width={64}
            height={64}
            className="mb-4 opacity-80"
          />
          <h1 className="font-serif text-3xl font-light tracking-wide text-ink">
            Academy
          </h1>
        </div>

        <div className="rounded-2xl border border-rule bg-white/60 p-8 shadow-sm backdrop-blur-sm">
          {children}
        </div>

        <p className="mt-6 text-center font-mono text-xs tracking-wider text-ink-soft uppercase">
          Still & Social Staff Portal
        </p>
      </div>
    </div>
  )
}
