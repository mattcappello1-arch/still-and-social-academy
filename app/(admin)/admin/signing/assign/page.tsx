import { createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { generateToken, expiryFromNow } from "@/lib/tokens";
import { sendInvite } from "@/lib/email";

async function assignDocument(formData: FormData) {
  "use server";
  const staffId = String(formData.get("staff_id"));
  const documentId = String(formData.get("document_id"));
  if (!staffId || !documentId) return;

  const db = await createAdminClient();
  const token = generateToken();
  const expiresAt = expiryFromNow(7);
  const now = new Date().toISOString();

  const { data: assignment } = await db.from("academy_signing_assignments").insert({
    staff_id: staffId,
    document_id: documentId,
    token,
    status: "sent",
    sent_at: now,
    expires_at: expiresAt,
  }).select("id").single();

  if (assignment) {
    await db.from("academy_signing_audit").insert({
      assignment_id: assignment.id,
      event_type: "sent",
      actor: "admin",
    });

    // Get staff and doc details for email
    const [{ data: staff }, { data: doc }] = await Promise.all([
      db.from("academy_staff").select("first_name, last_name, email").eq("id", staffId).single(),
      db.from("academy_signing_documents").select("title").eq("id", documentId).single(),
    ]);

    if (staff && doc) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://still-and-social-academy.vercel.app";
      const signUrl = `${appUrl}/sign/${token}`;
      await sendInvite(staff.email, `${staff.first_name} ${staff.last_name}`, doc.title, signUrl);
    }
  }

  redirect("/admin/signing");
}

export default async function AssignDocumentPage() {
  const db = await createAdminClient();

  const [{ data: staffList }, { data: documents }] = await Promise.all([
    db.from("academy_staff").select("id, first_name, last_name, email, role").eq("status", "active").order("first_name"),
    db.from("academy_signing_documents").select("id, title, doc_type").order("created_at", { ascending: false }),
  ]);

  return (
    <div className="max-w-xl">
      <h1 className="font-serif text-3xl text-charcoal font-light mb-2">Assign Document</h1>
      <p className="text-ink-soft text-sm mb-8">Send a document to a staff member for signing.</p>

      <form action={assignDocument} className="space-y-5">
        <div>
          <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-ink-soft mb-1.5">Staff Member</label>
          <select name="staff_id" required className="w-full bg-white border border-rule rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-olive">
            <option value="">Select staff...</option>
            {staffList?.map((s: any) => (
              <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.email})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-ink-soft mb-1.5">Document</label>
          <select name="document_id" required className="w-full bg-white border border-rule rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-olive">
            <option value="">Select document...</option>
            {documents?.map((d: any) => (
              <option key={d.id} value={d.id}>{d.title} ({d.doc_type})</option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <a href="/admin/signing" className="px-4 py-2.5 border border-rule rounded-lg text-sm text-ink-soft hover:bg-cream-soft transition">
            Cancel
          </a>
          <button type="submit" className="bg-sienna text-white px-6 py-2.5 rounded-lg text-sm hover:bg-sienna-dk transition">
            Send for Signing
          </button>
        </div>
      </form>
    </div>
  );
}
