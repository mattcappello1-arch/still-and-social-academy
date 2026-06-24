import { createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getRoleLabel, getDepartmentLabel } from "@/lib/utils/roles";
import Link from "next/link";
import { StaffProfileTabs, ResetPasswordForm } from "./components";

async function updateStatus(formData: FormData) {
  "use server";
  const staffId = String(formData.get("staff_id"));
  const newStatus = String(formData.get("status"));
  if (!staffId || !newStatus) return;

  const db = await createAdminClient();
  await db.from("academy_staff").update({ status: newStatus }).eq("id", staffId);
  redirect(`/admin/staff/${staffId}`);
}

async function updateTalentCategory(formData: FormData) {
  "use server";
  const staffId = String(formData.get("staff_id"));
  const category = String(formData.get("category"));
  if (!staffId || !category) return;

  const db = await createAdminClient();
  await db.from("academy_talent_tracking").upsert(
    { staff_id: staffId, category, updated_at: new Date().toISOString() },
    { onConflict: "staff_id" }
  );
  redirect(`/admin/staff/${staffId}`);
}

async function addManagerNote(formData: FormData) {
  "use server";
  const staffId = String(formData.get("staff_id"));
  const note = String(formData.get("note"));
  if (!staffId || !note) return;

  const db = await createAdminClient();
  await db.from("academy_reviews").insert({
    staff_id: staffId,
    review_type: "quick_note",
    status: "completed",
    manager_strengths: note,
    manager_areas_for_development: "",
    manager_training_recommendations: "",
    manager_future_opportunities: "",
  });
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

  // Personal details
  const { data: personalDetails } = await db
    .from("academy_staff_personal_details")
    .select("*")
    .eq("staff_id", staffId)
    .single();

  // Training progress
  const { data: assignedPaths } = await db
    .from("academy_role_training_paths")
    .select("*, academy_training_paths(id, title, slug, department)")
    .eq("role", staff.role)
    .order("sort_order");

  const { data: progress } = await db
    .from("academy_staff_module_progress")
    .select("module_id, status, completed_at, manager_signoff_by, manager_signoff_at")
    .eq("staff_id", staffId);

  const progressMap = new Map((progress ?? []).map((p: any) => [p.module_id, p.status]));

  const pathIds = (assignedPaths ?? []).map((ap: any) => ap.academy_training_paths?.id).filter(Boolean);
  const { data: allModules } = await db
    .from("academy_training_modules")
    .select("id, path_id, title")
    .in("path_id", pathIds.length ? pathIds : ["none"]);

  // Build module progress map with sign-off data
  const moduleProgressMap = new Map((progress ?? []).map((p: any) => [p.module_id, p]));

  const pathProgress = (assignedPaths ?? []).map((ap: any) => {
    const pathModules = (allModules ?? []).filter((m: any) => m.path_id === ap.academy_training_paths?.id);
    const completed = pathModules.filter((m: any) => progressMap.get(m.id) === "completed").length;
    const total = pathModules.length;
    const modules = pathModules.map((m: any) => {
      const prog = moduleProgressMap.get(m.id);
      return {
        id: m.id,
        title: m.title || m.id,
        status: prog?.status ?? "not_started",
        completed_at: prog?.completed_at ?? null,
        manager_signoff_at: prog?.manager_signoff_at ?? null,
        manager_signoff_by: prog?.manager_signoff_by ?? null,
      };
    });
    return {
      ...ap.academy_training_paths,
      completed,
      total,
      pct: total > 0 ? Math.round((completed / total) * 100) : 0,
      modules,
    };
  });

  // Certifications
  const { data: certifications } = await db
    .from("academy_certifications")
    .select("*")
    .eq("staff_id", staffId)
    .order("created_at", { ascending: false });

  // Performance reviews
  const { data: reviews } = await db
    .from("academy_reviews")
    .select("*")
    .eq("staff_id", staffId)
    .order("created_at", { ascending: false });

  // Growth goals
  const { data: goals } = await db
    .from("academy_goals")
    .select("*")
    .eq("staff_id", staffId)
    .order("created_at", { ascending: false });

  // Skill levels
  const { data: skillLevels } = await db
    .from("academy_skill_levels")
    .select("skill_name, level")
    .eq("staff_id", staffId);

  // Recognition
  const { data: recognition } = await db
    .from("academy_recognition")
    .select("*")
    .eq("staff_id", staffId)
    .order("created_at", { ascending: false });

  // Achievements
  const { data: achievements } = await db
    .from("academy_achievements")
    .select("*")
    .eq("staff_id", staffId)
    .order("created_at", { ascending: false });

  // Wellbeing check-ins (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const { data: wellbeingCheckins } = await db
    .from("academy_wellbeing_checkins")
    .select("*")
    .eq("staff_id", staffId)
    .gte("created_at", sixMonthsAgo.toISOString())
    .order("created_at", { ascending: false });

  // Signing assignments
  const { data: signingDocs } = await db
    .from("academy_signing_assignments")
    .select("*, academy_signing_documents(title, doc_type)")
    .eq("staff_id", staffId)
    .order("created_at", { ascending: false });

  // Shift readiness
  const { data: shiftReadiness } = await db
    .from("academy_shift_readiness")
    .select("*")
    .eq("staff_id", staffId)
    .order("created_at", { ascending: false })
    .limit(10);

  // Talent tracking
  const { data: talentTracking } = await db
    .from("academy_talent_tracking")
    .select("*")
    .eq("staff_id", staffId)
    .single();

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    active: "bg-green-100 text-green-800",
    inactive: "bg-neutral-200 text-neutral-600",
  };

  const overallCompleted = pathProgress.reduce((sum, p) => sum + p.completed, 0);
  const overallTotal = pathProgress.reduce((sum, p) => sum + p.total, 0);
  const overallPct = overallTotal > 0 ? Math.round((overallCompleted / overallTotal) * 100) : 0;

  // Compute days since start
  const daysSinceStart = staff.start_date
    ? Math.floor((Date.now() - new Date(staff.start_date).getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const isOnProbation = daysSinceStart !== null && daysSinceStart <= 90;

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
            {isOnProbation && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-sienna/10 text-sienna">
                Probation (Day {daysSinceStart})
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
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
      </div>

      {/* Summary cards */}
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

      {/* Tabbed sections */}
      <StaffProfileTabs
        staffId={staffId}
        staff={staff}
        personalDetails={personalDetails}
        pathProgress={pathProgress}
        certifications={certifications ?? []}
        reviews={reviews ?? []}
        goals={goals ?? []}
        skillLevels={skillLevels ?? []}
        recognition={recognition ?? []}
        achievements={achievements ?? []}
        wellbeingCheckins={wellbeingCheckins ?? []}
        signingDocs={signingDocs ?? []}
        shiftReadiness={shiftReadiness ?? []}
        talentTracking={talentTracking}
        updateTalentCategoryAction={updateTalentCategory}
        addManagerNoteAction={addManagerNote}
      />

      {/* Reset Password section */}
      <div className="mt-8">
        <ResetPasswordForm staffId={staffId} />
      </div>
    </div>
  );
}
