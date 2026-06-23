import { createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getRoleLabel, getDepartmentLabel } from "@/lib/utils/roles";
import Link from "next/link";

async function updateStatus(formData: FormData) {
  "use server";
  const staffId = String(formData.get("staff_id"));
  const newStatus = String(formData.get("status"));
  if (!staffId || !newStatus) return;

  const db = await createAdminClient();
  await db.from("academy_staff").update({ status: newStatus }).eq("id", staffId);
  redirect(`/admin/staff/${staffId}`);
}

export default async function StaffDetailPage({
  params,
}: {
  params: Promise<{ staffId: string }>;
}) {
  const { staffId } = await params;
  const db = await createAdminClient();

  const { data: staff } = await db
    .from("academy_staff")
    .select("*")
    .eq("id", staffId)
    .single();

  if (!staff) redirect("/admin/staff");

  // Get training progress
  const { data: assignedPaths } = await db
    .from("academy_role_training_paths")
    .select("*, academy_training_paths(id, title, slug, department)")
    .eq("role", staff.role)
    .order("sort_order");

  // Get all module progress for this staff
  const { data: progress } = await db
    .from("academy_staff_module_progress")
    .select("module_id, status")
    .eq("staff_id", staffId);

  const progressMap = new Map((progress ?? []).map((p: any) => [p.module_id, p.status]));

  // Get module counts per path
  const pathIds = (assignedPaths ?? []).map((ap: any) => ap.academy_training_paths?.id).filter(Boolean);
  const { data: allModules } = await db
    .from("academy_training_modules")
    .select("id, path_id")
    .in("path_id", pathIds.length ? pathIds : ["none"]);

  // Calculate completion per path
  const pathProgress = (assignedPaths ?? []).map((ap: any) => {
    const pathModules = (allModules ?? []).filter((m: any) => m.path_id === ap.academy_training_paths?.id);
    const completed = pathModules.filter((m: any) => progressMap.get(m.id) === "completed").length;
    const total = pathModules.length;
    return {
      ...ap.academy_training_paths,
      completed,
      total,
      pct: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  });

  // Get signing assignments
  const { data: signingDocs } = await db
    .from("academy_signing_assignments")
    .select("*, academy_signing_documents(title, doc_type)")
    .eq("staff_id", staffId)
    .order("created_at", { ascending: false });

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    active: "bg-green-100 text-green-800",
    inactive: "bg-neutral-200 text-neutral-600",
  };

  const overallCompleted = pathProgress.reduce((sum, p) => sum + p.completed, 0);
  const overallTotal = pathProgress.reduce((sum, p) => sum + p.total, 0);
  const overallPct = overallTotal > 0 ? Math.round((overallCompleted / overallTotal) * 100) : 0;

  return (
    <div>
      <Link href="/admin/staff" className="text-sienna text-sm hover:underline">&larr; All Staff</Link>

      <div className="mt-4 mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-serif text-3xl text-charcoal font-light">{staff.first_name} {staff.last_name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="font-mono text-xs text-ink-soft">{staff.email}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${statusColors[staff.status]}`}>
              {staff.status}
            </span>
          </div>
        </div>
        <form action={updateStatus}>
          <input type="hidden" name="staff_id" value={staffId} />
          {staff.status === "active" ? (
            <button name="status" value="inactive" className="text-sm px-4 py-2 border border-rule rounded-lg text-ink-soft hover:bg-cream-soft transition">
              Deactivate
            </button>
          ) : (
            <button name="status" value="active" className="text-sm px-4 py-2 bg-sienna text-white rounded-lg hover:bg-sienna-dk transition">
              Reactivate
            </button>
          )}
        </form>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-cream-soft border border-rule rounded-xl p-5">
          <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-soft mb-2">Role</div>
          <div className="text-lg text-ink">{getRoleLabel(staff.role)}</div>
          <div className="text-sm text-ink-soft">{getDepartmentLabel(staff.department)}</div>
        </div>
        <div className="bg-cream-soft border border-rule rounded-xl p-5">
          <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-soft mb-2">Employment</div>
          <div className="text-lg text-ink capitalize">{staff.employment_type?.replace("_", " ") || "-"}</div>
          <div className="text-sm text-ink-soft">Started {staff.start_date || "-"}</div>
        </div>
        <div className="bg-cream-soft border border-rule rounded-xl p-5">
          <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-soft mb-2">Training Progress</div>
          <div className="text-lg text-ink">{overallPct}%</div>
          <div className="w-full bg-oatmeal/30 rounded-full h-2 mt-2">
            <div className="bg-sienna h-2 rounded-full transition-all" style={{ width: `${overallPct}%` }} />
          </div>
        </div>
      </div>

      {/* Training Paths Progress */}
      <div className="bg-cream-soft border border-rule rounded-xl overflow-hidden mb-8">
        <div className="px-5 py-3 border-b border-rule">
          <h2 className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-soft">Training Paths</h2>
        </div>
        <div className="divide-y divide-rule">
          {pathProgress.map((p: any) => (
            <div key={p.id} className="px-5 py-4 flex items-center gap-4">
              <div className="flex-1">
                <div className="text-ink font-medium">{p.title}</div>
                <div className="text-xs text-ink-soft">{p.completed} of {p.total} modules</div>
              </div>
              <div className="w-32">
                <div className="w-full bg-oatmeal/30 rounded-full h-1.5">
                  <div className="bg-sienna h-1.5 rounded-full" style={{ width: `${p.pct}%` }} />
                </div>
              </div>
              <span className="font-mono text-xs text-ink-soft w-10 text-right">{p.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Signed Documents */}
      <div className="bg-cream-soft border border-rule rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-rule">
          <h2 className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-soft">Documents</h2>
        </div>
        {!signingDocs?.length ? (
          <div className="p-8 text-center text-ink-soft text-sm">No documents assigned yet.</div>
        ) : (
          <div className="divide-y divide-rule">
            {signingDocs.map((d: any) => (
              <div key={d.id} className="px-5 py-4 flex items-center justify-between">
                <div>
                  <div className="text-ink">{d.academy_signing_documents?.title}</div>
                  <div className="text-xs text-ink-soft">{d.academy_signing_documents?.doc_type}</div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${
                  d.status === "signed" ? "bg-sage/20 text-sage-deep" :
                  d.status === "viewed" ? "bg-olive/10 text-olive" :
                  "bg-sienna/10 text-sienna"
                }`}>
                  {d.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
