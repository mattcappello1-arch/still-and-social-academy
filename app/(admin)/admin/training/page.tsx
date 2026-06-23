import { createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminTrainingPage() {
  const db = await createAdminClient();

  const { data: paths } = await db
    .from("academy_training_paths")
    .select("*, academy_training_modules(id)")
    .order("sort_order");

  const deptColors: Record<string, string> = {
    universal: "bg-sienna/10 text-sienna",
    foh: "bg-olive/10 text-olive",
    kitchen: "bg-rosewood/10 text-rosewood",
    leadership: "bg-coffee/20 text-coffee",
  };

  const deptLabels: Record<string, string> = {
    universal: "All Staff",
    foh: "Front of House",
    kitchen: "Kitchen",
    leadership: "Leadership",
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-serif text-3xl text-charcoal font-light">Training Management</h1>
          <p className="text-ink-soft text-sm mt-1">Manage training paths and modules.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {paths?.map((path: any) => (
          <Link
            key={path.id}
            href={`/admin/training/${path.id}`}
            className="bg-cream-soft border border-rule rounded-xl p-5 hover:shadow-md transition group"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-serif text-xl text-charcoal font-light group-hover:text-sienna transition">{path.title}</h3>
                <p className="text-ink-soft text-sm mt-1">{path.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${deptColors[path.department] || ""}`}>
                  {deptLabels[path.department] || path.department}
                </span>
                <span className="font-mono text-xs text-ink-soft">
                  {path.academy_training_modules?.length || 0} modules
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
