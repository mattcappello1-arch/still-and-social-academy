'use client'

export function ExportSubscribersButton() {
  async function handleExport() {
    const res = await fetch('/api/subscribers/export')
    if (!res.ok) return alert('Failed to export')
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={handleExport}
      className="rounded-lg border border-rule bg-white/60 px-4 py-2.5 font-mono text-sm tracking-wide text-ink transition hover:border-sienna/30 hover:text-sienna"
    >
      Export CSV
    </button>
  )
}
