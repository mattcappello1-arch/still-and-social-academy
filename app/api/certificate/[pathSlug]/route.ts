import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

function buildCertificatePdf(staffName: string, pathTitle: string, completedDate: string): Uint8Array {
  const lines = [
    '',
    '',
    '                    STILL & SOCIAL ACADEMY',
    '',
    '              ─────────────────────────────────',
    '',
    '                  CERTIFICATE OF COMPLETION',
    '',
    '              ─────────────────────────────────',
    '',
    '',
    `    This certifies that`,
    '',
    `                        ${staffName}`,
    '',
    `    has successfully completed all modules in`,
    '',
    `                        ${pathTitle}`,
    '',
    '',
    `    Date of Completion: ${completedDate}`,
    '',
    '',
    '              ─────────────────────────────────',
    '',
    '    Awarded by Still & Social Academy',
    '    Melbourne, Australia',
    '',
    '',
    '    This certificate was generated digitally via',
    '    the Still & Social Academy training platform.',
    '',
  ].join('\n')

  // Build a minimal valid PDF
  const content = lines
  const stream = `stream\nBT\n/F1 12 Tf\n${content.split('\n').map((line, i) => `1 0 0 1 36 ${750 - i * 18} Tm\n(${line.replace(/\(/g, '\\(').replace(/\)/g, '\\)')}) Tj`).join('\n')}\nET\nendstream`

  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj

2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj

3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]
   /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj

4 0 obj
<< /Length ${stream.length - 'stream\n'.length - '\nendstream'.length} >>
${stream}
endobj

5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj

xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000266 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
0
%%EOF`

  return new TextEncoder().encode(pdf)
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pathSlug: string }> }
) {
  const { pathSlug } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Get staff info
  const { data: staff } = await supabase
    .from('academy_staff')
    .select('first_name, last_name')
    .eq('id', user.id)
    .single()

  if (!staff) {
    return new Response('Staff not found', { status: 404 })
  }

  // Get path
  const { data: path } = await supabase
    .from('academy_training_paths')
    .select('id, title')
    .eq('slug', pathSlug)
    .single()

  if (!path) {
    return new Response('Training path not found', { status: 404 })
  }

  // Get all active modules for this path
  const { data: modules } = await supabase
    .from('academy_training_modules')
    .select('id')
    .eq('path_id', path.id)
    .eq('is_active', true)

  if (!modules || modules.length === 0) {
    return new Response('No modules in this path', { status: 400 })
  }

  // Get completed progress
  const { data: progress } = await supabase
    .from('academy_staff_module_progress')
    .select('module_id, status, completed_at')
    .eq('staff_id', user.id)
    .eq('status', 'completed')
    .in('module_id', modules.map((m) => m.id))

  if (!progress || progress.length < modules.length) {
    return new Response('Training path not yet complete', { status: 403 })
  }

  // Find the latest completion date
  const completionDates = progress
    .filter((p) => p.completed_at)
    .map((p) => new Date(p.completed_at))
  const latestDate = completionDates.length > 0
    ? new Date(Math.max(...completionDates.map((d) => d.getTime())))
    : new Date()

  const completedDate = latestDate.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Australia/Melbourne',
  })

  const staffName = `${staff.first_name} ${staff.last_name}`
  const pdfBytes = buildCertificatePdf(staffName, path.title, completedDate)

  const filename = `certificate-${pathSlug}.pdf`

  return new Response(Buffer.from(pdfBytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
