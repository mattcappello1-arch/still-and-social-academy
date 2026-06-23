export default function DonePage() {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-[560px] bg-cream border border-rule rounded-2xl p-9 text-center shadow-[0_14px_40px_rgba(60,48,30,0.07)]">
        <div className="text-5xl mb-4">&#10003;</div>
        <h1 className="font-serif text-3xl text-charcoal mb-2 font-light">All done.</h1>
        <p className="text-ink-soft text-sm mb-2">
          Your document has been signed and recorded. A confirmation has been sent to your email.
        </p>
        <p className="text-ink-soft text-sm mb-6">
          You can close this page now.
        </p>
        <p className="font-serif italic text-rosewood">Come as you are. Leave a little more whole.</p>
      </div>
    </div>
  );
}
