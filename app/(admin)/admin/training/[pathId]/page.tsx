import { createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

async function addModule(formData: FormData) {
  "use server";
  const pathId = String(formData.get("path_id"));
  const title = String(formData.get("title")).trim();
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const description = String(formData.get("description")).trim();
  const body = String(formData.get("body")).trim();
  if (!title || !pathId) return;

  const db = await createAdminClient();

  // Get next sort_order
  const { data: existing } = await db
    .from("academy_training_modules")
    .select("sort_order")
    .eq("path_id", pathId)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextOrder = (existing?.[0]?.sort_order ?? 0) + 1;

  await db.from("academy_training_modules").insert({
    path_id: pathId,
    slug,
    title,
    description: description || null,
    content_type: "text",
    content: { blocks: [{ type: "text", data: { html: `<p>${body}</p>` } }] },
    estimated_minutes: 3,
    sort_order: nextOrder,
  });

  redirect(`/admin/training/${pathId}`);
}

export default async function AdminTrainingPathPage({
  params,
}: {
  params: Promise<{ pathId: string }>;
}) {
  const { pathId } = await params;
  const db = await createAdminClient();

  const { data: path } = await db
    .from("academy_training_paths")
    .select("*")
    .eq("id", pathId)
    .single();

  if (!path) redirect("/admin/training");

  const { data: modules } = await db
    .from("academy_training_modules")
    .select("*")
    .eq("path_id", pathId)
    .order("sort_order");

  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/training" className="text-sienna text-sm hover:underline">&larr; All Training Paths</Link>
        <h1 className="font-serif text-3xl text-charcoal font-light mt-2">{path.title}</h1>
        <p className="text-ink-soft text-sm mt-1">{path.description}</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        {/* Modules List */}
        <div className="bg-cream-soft border border-rule rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-rule">
            <h2 className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-soft">
              {modules?.length || 0} Modules
            </h2>
          </div>
          {!modules?.length ? (
            <div className="p-8 text-center text-ink-soft text-sm">No modules yet. Add one using the form.</div>
          ) : (
            <div className="divide-y divide-rule">
              {modules.map((m: any, i: number) => (
                <div key={m.id} className="px-5 py-4 flex items-start gap-4">
                  <span className="font-mono text-[10px] text-ink-soft mt-1 w-6 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                  <div className="flex-1">
                    <div className="font-medium text-ink">{m.title}</div>
                    {m.description && <div className="text-xs text-ink-soft mt-0.5">{m.description}</div>}
                  </div>
                  <span className="font-mono text-[10px] text-ink-soft shrink-0">
                    {m.estimated_minutes ? `${m.estimated_minutes} min` : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Module Form */}
        <div className="bg-cream-soft border border-rule rounded-xl p-5">
          <h3 className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-soft mb-4">Add Module</h3>
          <form action={addModule} className="space-y-3">
            <input type="hidden" name="path_id" value={pathId} />
            <input name="title" placeholder="Module title" required
              className="w-full bg-white border border-rule rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-olive" />
            <input name="description" placeholder="Short description (optional)"
              className="w-full bg-white border border-rule rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-olive" />
            <textarea name="body" placeholder="Module content..." rows={6} required
              className="w-full bg-white border border-rule rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-olive resize-none" />
            <button type="submit" className="w-full bg-sienna text-white text-sm py-2.5 rounded-lg hover:bg-sienna-dk transition">
              Add Module
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
