import { createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ModuleEditor } from "@/components/admin/ModuleEditor";

/* ────────────────────────────────────────────
   Server actions
   ──────────────────────────────────────────── */

async function saveModule(
  moduleId: string,
  data: {
    title: string;
    description: string;
    estimatedMinutes: number;
    blocks: unknown[];
  }
) {
  "use server";
  const db = await createAdminClient();
  const { error } = await db
    .from("academy_training_modules")
    .update({
      title: data.title,
      description: data.description || null,
      content: { blocks: data.blocks },
      estimated_minutes: data.estimatedMinutes,
    })
    .eq("id", moduleId);

  if (error) return { error: error.message };
  return {};
}

async function deleteModule(formData: FormData) {
  "use server";
  const moduleId = String(formData.get("module_id"));
  const pathId = String(formData.get("path_id"));
  if (!moduleId) return;

  const db = await createAdminClient();
  await db.from("academy_training_modules").delete().eq("id", moduleId);
  redirect(`/admin/training/${pathId}`);
}

async function addQuiz(formData: FormData) {
  "use server";
  const moduleId = String(formData.get("module_id"));
  const pathId = String(formData.get("path_id"));
  const title = String(formData.get("quiz_title")).trim();
  const passScore = parseInt(String(formData.get("pass_score"))) || 80;
  if (!moduleId || !title) return;

  const db = await createAdminClient();
  await db.from("academy_quizzes").insert({
    module_id: moduleId,
    title,
    pass_score: passScore,
    questions: [],
  });

  redirect(`/admin/training/${pathId}/${moduleId}`);
}

async function updateQuiz(formData: FormData) {
  "use server";
  const quizId = String(formData.get("quiz_id"));
  const pathId = String(formData.get("path_id"));
  const moduleId = String(formData.get("module_id"));
  const questionsJson = String(formData.get("questions_json")).trim();
  const passScore = parseInt(String(formData.get("pass_score"))) || 80;
  if (!quizId) return;

  const db = await createAdminClient();
  try {
    const questions = JSON.parse(questionsJson);
    await db.from("academy_quizzes").update({ questions, pass_score: passScore }).eq("id", quizId);
  } catch {
    // Invalid JSON, ignore
  }

  redirect(`/admin/training/${pathId}/${moduleId}`);
}

async function deleteQuiz(formData: FormData) {
  "use server";
  const quizId = String(formData.get("quiz_id"));
  const pathId = String(formData.get("path_id"));
  const moduleId = String(formData.get("module_id"));
  if (!quizId) return;

  const db = await createAdminClient();
  await db.from("academy_quizzes").delete().eq("id", quizId);
  redirect(`/admin/training/${pathId}/${moduleId}`);
}

/* ────────────────────────────────────────────
   Page
   ──────────────────────────────────────────── */

export default async function EditModulePage({
  params,
}: {
  params: Promise<{ pathId: string; moduleId: string }>;
}) {
  const { pathId, moduleId } = await params;
  const db = await createAdminClient();

  const { data: module } = await db.from("academy_training_modules").select("*").eq("id", moduleId).single();
  if (!module) redirect(`/admin/training/${pathId}`);

  const { data: path } = await db.from("academy_training_paths").select("title").eq("id", pathId).single();
  const { data: quiz } = await db.from("academy_quizzes").select("*").eq("module_id", moduleId).single();

  // Extract blocks from content
  const blocks = (module.content as Record<string, unknown>)?.blocks ?? [];

  return (
    <div>
      <div className="mb-6">
        <Link href={`/admin/training/${pathId}`} className="text-sienna text-sm hover:underline">&larr; {path?.title || "Back"}</Link>
        <h1 className="font-serif text-3xl text-charcoal font-light mt-2">Edit Module</h1>
      </div>

      {/* Block Editor */}
      <ModuleEditor
        initialBlocks={blocks as never[]}
        moduleId={moduleId}
        pathId={pathId}
        title={module.title}
        description={module.description || ""}
        estimatedMinutes={module.estimated_minutes || 3}
        saveAction={saveModule}
      />

      {/* Quiz & Danger Zone below the editor */}
      <div className="mt-8 grid lg:grid-cols-2 gap-8">
        {/* Quiz section */}
        <div>
          {quiz ? (
            <div className="bg-cream-soft border border-rule rounded-xl p-5 space-y-4">
              <h3 className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-soft">Quiz: {quiz.title}</h3>
              <p className="text-xs text-ink-soft">{(quiz.questions as unknown[])?.length || 0} questions · Pass score: {quiz.pass_score}%</p>

              <form action={updateQuiz} className="space-y-3">
                <input type="hidden" name="quiz_id" value={quiz.id} />
                <input type="hidden" name="path_id" value={pathId} />
                <input type="hidden" name="module_id" value={moduleId} />

                <div>
                  <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-ink-soft mb-1.5">Pass Score %</label>
                  <input name="pass_score" type="number" defaultValue={quiz.pass_score} min={1} max={100}
                    className="w-full bg-white border border-rule rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-olive" />
                </div>

                <div>
                  <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-ink-soft mb-1.5">Questions (JSON)</label>
                  <textarea name="questions_json" defaultValue={JSON.stringify(quiz.questions, null, 2)} rows={12}
                    className="w-full bg-white border border-rule rounded-lg px-3 py-2.5 text-xs font-mono focus:outline-none focus:border-olive resize-y" />
                  <p className="text-[10px] text-ink-soft mt-1">
                    Multiple choice: [{"{"}&quot;question&quot;:&quot;...&quot;, &quot;options&quot;:[...], &quot;correct&quot;:0{"}"}]<br/>
                    Reflection: [{"{"}&quot;type&quot;:&quot;reflection&quot;, &quot;question&quot;:&quot;...&quot;, &quot;minLength&quot;:50{"}"}]<br/>
                    Scenario: [{"{"}&quot;type&quot;:&quot;scenario&quot;, &quot;question&quot;:&quot;...&quot;, &quot;context&quot;:&quot;...&quot;, &quot;minLength&quot;:30{"}"}]
                  </p>
                </div>

                <button type="submit" className="w-full bg-charcoal text-cream text-sm py-2.5 rounded-lg hover:bg-coffee transition">
                  Update Quiz
                </button>
              </form>

              <form action={deleteQuiz}>
                <input type="hidden" name="quiz_id" value={quiz.id} />
                <input type="hidden" name="path_id" value={pathId} />
                <input type="hidden" name="module_id" value={moduleId} />
                <button type="submit" className="w-full text-rosewood text-sm py-2 hover:underline">
                  Remove Quiz
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-cream-soft border border-rule rounded-xl p-5">
              <h3 className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-soft mb-4">Add Quiz</h3>
              <form action={addQuiz} className="space-y-3">
                <input type="hidden" name="module_id" value={moduleId} />
                <input type="hidden" name="path_id" value={pathId} />
                <input name="quiz_title" placeholder="Quiz title" required
                  className="w-full bg-white border border-rule rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-olive" />
                <input name="pass_score" type="number" defaultValue={80} min={1} max={100} placeholder="Pass score %"
                  className="w-full bg-white border border-rule rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-olive" />
                <button type="submit" className="w-full bg-sienna text-white text-sm py-2.5 rounded-lg hover:bg-sienna-dk transition">
                  Create Quiz
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Delete module */}
        <div>
          <form action={deleteModule} className="bg-rosewood/5 border border-rosewood/20 rounded-xl p-6">
            <input type="hidden" name="module_id" value={moduleId} />
            <input type="hidden" name="path_id" value={pathId} />
            <h3 className="font-mono text-[10px] tracking-[0.2em] uppercase text-rosewood mb-2">Danger Zone</h3>
            <p className="text-sm text-ink-soft mb-3">Deleting this module will remove all associated progress and quiz data.</p>
            <button type="submit" className="bg-rosewood text-white px-4 py-2 rounded-lg text-sm hover:bg-rosewood/80 transition"
              onClick={(e) => { if (!confirm("Delete this module?")) e.preventDefault(); }}>
              Delete Module
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
