import { createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { generateToken, expiryFromNow } from "@/lib/tokens";
import { TemplateViewer } from "./template-viewer";

async function createSigningDocFromTemplate(formData: FormData) {
  "use server";
  const templateId = String(formData.get("template_id"));
  const templateTitle = String(formData.get("template_title"));
  const templateDocType = String(formData.get("template_doc_type"));
  const templateBody = String(formData.get("template_body"));
  if (!templateId || !templateTitle) return;

  const db = await createAdminClient();

  // Create a signing document from the template
  await db.from("academy_signing_documents").insert({
    title: templateTitle,
    doc_type: templateDocType || "Other",
    body: templateBody || null,
  });

  redirect("/admin/signing/documents");
}

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

  const serializedTemplates = (templates ?? []).map((t: any) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    category: t.category,
    requires_signature: t.requires_signature,
    template_content: t.template_content,
    categoryLabel: categoryLabels[t.category] || t.category,
    categoryColor: categoryColors[t.category] || "",
  }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-charcoal font-light">Document Templates</h1>
        <p className="text-ink-soft text-sm mt-1">Onboarding document templates for staff. Click a template to view details.</p>
      </div>

      <TemplateViewer
        templates={serializedTemplates}
        createSigningDocAction={createSigningDocFromTemplate}
      />
    </div>
  );
}
