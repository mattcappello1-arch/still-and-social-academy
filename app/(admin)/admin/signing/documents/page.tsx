import { createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DOC_TYPES } from "@/lib/status";

async function createDocument(formData: FormData) {
  "use server";
  const title = String(formData.get("title")).trim();
  const docType = String(formData.get("doc_type")).trim();
  const body = String(formData.get("body")).trim();
  if (!title || !docType) return;

  const db = await createAdminClient();
  await db.from("academy_signing_documents").insert({ title, doc_type: docType, body: body || null });
  redirect("/admin/signing/documents");
}

async function createFromTemplate(formData: FormData) {
  "use server";
  const templateId = String(formData.get("template_id"));
  if (!templateId) return;

  const db = await createAdminClient();
  const { data: template } = await db.from("academy_signing_templates").select("*").eq("id", templateId).single();
  if (!template) return;

  await db.from("academy_signing_documents").insert({
    title: template.title,
    doc_type: template.doc_type,
    body: template.body,
  });
  redirect("/admin/signing/documents");
}

export default async function DocumentsPage() {
  const db = await createAdminClient();
  const [{ data: documents }, { data: templates }] = await Promise.all([
    db.from("academy_signing_documents").select("*").order("created_at", { ascending: false }),
    db.from("academy_signing_templates").select("*").order("created_at", { ascending: false }),
  ]);

  return (
    <div>
      <h1 className="font-serif text-3xl text-charcoal font-light mb-2">Signing Documents</h1>
      <p className="text-ink-soft text-sm mb-8">Create documents from templates or write custom ones.</p>

      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        {/* Documents List */}
        <div className="bg-cream-soft border border-rule rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-rule">
            <h2 className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-soft">All Documents</h2>
          </div>
          {!documents?.length ? (
            <div className="p-8 text-center text-ink-soft text-sm">No documents yet. Create one from a template or write your own.</div>
          ) : (
            <div className="divide-y divide-rule">
              {documents.map((d: any) => (
                <div key={d.id} className="px-5 py-4">
                  <div className="font-medium text-ink">{d.title}</div>
                  <div className="text-xs text-ink-soft mt-1">{d.doc_type} &middot; {new Date(d.created_at).toLocaleDateString("en-AU")}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Forms */}
        <div className="space-y-6">
          {/* From Template */}
          <div className="bg-cream-soft border border-rule rounded-xl p-5">
            <h3 className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-soft mb-4">Create from Template</h3>
            <form action={createFromTemplate} className="space-y-3">
              <select name="template_id" required className="w-full bg-white border border-rule rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-olive">
                <option value="">Select template...</option>
                {templates?.map((t: any) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
              <button type="submit" className="w-full bg-charcoal text-cream text-sm py-2.5 rounded-lg hover:bg-coffee transition">
                Create Document
              </button>
            </form>
          </div>

          {/* Custom Document */}
          <div className="bg-cream-soft border border-rule rounded-xl p-5">
            <h3 className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-soft mb-4">Create Custom Document</h3>
            <form action={createDocument} className="space-y-3">
              <input name="title" placeholder="Document title" required
                className="w-full bg-white border border-rule rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-olive" />
              <select name="doc_type" required className="w-full bg-white border border-rule rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-olive">
                <option value="">Document type...</option>
                {DOC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <textarea name="body" placeholder="Document content..." rows={6}
                className="w-full bg-white border border-rule rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-olive resize-none" />
              <button type="submit" className="w-full bg-sienna text-white text-sm py-2.5 rounded-lg hover:bg-sienna-dk transition">
                Create Document
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
