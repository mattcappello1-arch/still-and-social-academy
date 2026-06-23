import { createAdminClient } from "@/lib/supabase/server";

export default async function AdminDocumentsPage() {
  const db = await createAdminClient();

  const { data: templates } = await db
    .from("academy_document_templates")
    .select("*")
    .order("sort_order");

  const categoryLabels: Record<string, string> = {
    personal_info: "Personal Information",
    employment: "Employment",
    policy: "Policy",
    certification: "Certification",
  };

  const categoryColors: Record<string, string> = {
    personal_info: "bg-olive/10 text-olive",
    employment: "bg-sienna/10 text-sienna",
    policy: "bg-rosewood/10 text-rosewood",
    certification: "bg-coffee/20 text-coffee",
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-charcoal font-light">Document Templates</h1>
        <p className="text-ink-soft text-sm mt-1">Onboarding document templates for staff.</p>
      </div>

      <div className="grid gap-4">
        {templates?.map((t: any) => (
          <div key={t.id} className="bg-cream-soft border border-rule rounded-xl p-5 flex items-start justify-between">
            <div>
              <h3 className="text-ink font-medium">{t.title}</h3>
              <p className="text-ink-soft text-sm mt-1">{t.description}</p>
              <div className="flex items-center gap-3 mt-3">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${categoryColors[t.category] || ""}`}>
                  {categoryLabels[t.category] || t.category}
                </span>
                {t.requires_signature && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-charcoal/10 text-charcoal">
                    Signature Required
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
