import { createAdminClient } from "@/lib/supabase/server";
import { effectiveStatus, STATUS_META, type AssignmentStatus } from "@/lib/status";
import Link from "next/link";
import { redirect } from "next/navigation";

async function markDocumentComplete(formData: FormData) {
  "use server";
  const assignmentId = String(formData.get("assignment_id"));
  if (!assignmentId) return;

  const db = await createAdminClient();
  await db.from("academy_signing_assignments").update({
    status: "signed",
    signed_at: new Date().toISOString(),
    signer_name: "Completed externally",
  }).eq("id", assignmentId);

  redirect("/admin/signing");
}

export default async function SigningDashboard() {
  const db = await createAdminClient();

  const { data: assignments } = await db
    .from("academy_signing_assignments")
    .select("*, academy_staff(first_name, last_name, email), academy_signing_documents(title, doc_type)")
    .order("created_at", { ascending: false })
    .limit(50);

  // Get audit logs for signed assignments to show IP / user agent
  const signedIds = (assignments ?? [])
    .filter((a: any) => a.status === "signed" || a.signed_at)
    .map((a: any) => a.id);

  const { data: auditLogs } = signedIds.length
    ? await db
        .from("academy_signing_audit")
        .select("assignment_id, event_type, ip_address, user_agent, occurred_at")
        .in("assignment_id", signedIds)
        .eq("event_type", "signed")
    : { data: [] };

  const auditMap = new Map((auditLogs ?? []).map((a: any) => [a.assignment_id, a]));

  const { data: templates } = await db
    .from("academy_signing_templates")
    .select("id, title, doc_type")
    .order("created_at", { ascending: false });

  const stats = { draft: 0, sent: 0, viewed: 0, signed: 0, expired: 0 };
  (assignments ?? []).forEach((a: any) => {
    const s = effectiveStatus(a);
    stats[s]++;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-serif text-3xl text-charcoal font-light">Document Signing</h1>
          <p className="text-ink-soft text-sm mt-1">Manage documents, assign to staff, and track signatures.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/signing/documents" className="bg-cream-soft border border-rule text-ink text-sm px-4 py-2 rounded-lg hover:bg-oatmeal/30 transition">
            Manage Documents
          </Link>
          <Link href="/admin/signing/assign" className="bg-sienna text-white text-sm px-4 py-2 rounded-lg hover:bg-sienna-dk transition">
            Assign Document
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        {(Object.entries(stats) as [AssignmentStatus, number][]).map(([status, count]) => {
          const meta = STATUS_META[status];
          return (
            <div key={status} className="bg-cream-soft border border-rule rounded-xl p-4 text-center">
              <div className="text-2xl font-serif text-charcoal font-light">{count}</div>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${meta.cls}`}>
                {meta.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Recent Assignments */}
      <div className="bg-cream-soft border border-rule rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-rule">
          <h2 className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-soft">Recent Assignments</h2>
        </div>
        {!assignments?.length ? (
          <div className="p-8 text-center text-ink-soft text-sm">No documents assigned yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-rule text-left">
                <th className="px-5 py-3 font-mono text-[10px] tracking-wider uppercase text-ink-soft font-normal">Staff</th>
                <th className="px-5 py-3 font-mono text-[10px] tracking-wider uppercase text-ink-soft font-normal">Document</th>
                <th className="px-5 py-3 font-mono text-[10px] tracking-wider uppercase text-ink-soft font-normal">Status</th>
                <th className="px-5 py-3 font-mono text-[10px] tracking-wider uppercase text-ink-soft font-normal">Sent</th>
                <th className="px-5 py-3 font-mono text-[10px] tracking-wider uppercase text-ink-soft font-normal">Signed</th>
                <th className="px-5 py-3 font-mono text-[10px] tracking-wider uppercase text-ink-soft font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a: any) => {
                const status = effectiveStatus(a);
                const meta = STATUS_META[status];
                const audit = auditMap.get(a.id);
                const isNotSigned = status !== 'signed';
                return (
                  <tr key={a.id} className="border-b border-rule last:border-0 hover:bg-oatmeal/10">
                    <td className="px-5 py-3 text-ink">
                      {a.academy_staff?.first_name} {a.academy_staff?.last_name}
                      <span className="block text-[10px] text-ink-soft">{a.academy_staff?.email}</span>
                    </td>
                    <td className="px-5 py-3 text-ink-soft">
                      {a.academy_signing_documents?.title}
                      <span className="block text-[10px] text-ink-soft">{a.academy_signing_documents?.doc_type}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${meta.cls}`}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-ink-soft text-xs">
                      {a.sent_at ? new Date(a.sent_at).toLocaleDateString("en-AU") : "-"}
                    </td>
                    <td className="px-5 py-3 text-xs">
                      {a.signed_at ? (
                        <div>
                          <span className="text-ink-soft">{new Date(a.signed_at).toLocaleDateString("en-AU")}</span>
                          {a.signer_name && (
                            <span className="block text-[10px] text-ink-soft">By: {a.signer_name}</span>
                          )}
                          {audit?.ip_address && (
                            <span className="block text-[10px] text-ink-soft">IP: {audit.ip_address}</span>
                          )}
                        </div>
                      ) : "-"}
                    </td>
                    <td className="px-5 py-3">
                      {isNotSigned && (
                        <form action={markDocumentComplete}>
                          <input type="hidden" name="assignment_id" value={a.id} />
                          <button
                            type="submit"
                            className="rounded-lg border border-sage/30 bg-sage/5 px-3 py-1.5 font-mono text-[10px] tracking-wider text-sage-deep uppercase transition hover:bg-sage/20"
                          >
                            Mark Complete
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
