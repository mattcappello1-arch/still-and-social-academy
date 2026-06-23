import { createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

async function updateModule(formData: FormData) {
  "use server";
  const moduleId = String(formData.get("module_id"));
  const title = String(formData.get("title")).trim();
  const description = String(formData.get("description")).trim();
  const body = String(formData.get("body")).trim();
  const estimatedMinutes = parseInt(String(formData.get("estimated_minutes"))) || 3;
  const pathId = String(formData.get("path_id"));
  if (!moduleId || !title) return;

  const db = await createAdminClient();
  await db.from("academy_training_modules").update({
    title,
    description: description || null,
    content: { blocks: [{ type: "text", data: { html: body } }] },
    estimated_minutes: estimatedMinutes,
  }).eq("id", moduleId);

  redirect(`/admin/training/${pathId}/${moduleId}`);
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

  // Extract body from content blocks
  const blocks = (module.content as any)?.blocks ?? [];
  const textBlock = blocks.find((b: any) => b.type === "text");
  const body = textBlock?.data?.html ?? "";

  return (
    <div>
      <div className="mb-6">
        <Link href={`/admin/training/${pathId}`} className="text-sienna text-sm hover:underline">&larr; {path?.title || "Back"}</Link>
        <h1 className="font-serif text-3xl text-charcoal font-light mt-2">Edit Module</h1>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-8">
        {/* Edit Module */}
        <div className="space-y-6">
          <form action={updateModule} className="bg-cream-soft border border-rule rounded-xl p-6 space-y-4">
            <input type="hidden" name="module_id" value={moduleId} />
            <input type="hidden" name="path_id" value={pathId} />

            <div>
              <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-ink-soft mb-1.5">Title</label>
              <input name="title" defaultValue={module.title} required
                className="w-full bg-white border border-rule rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-olive" />
            </div>

            <div>
              <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-ink-soft mb-1.5">Description</label>
              <input name="description" defaultValue={module.description || ""}
                className="w-full bg-white border border-rule rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-olive" />
            </div>

            <div>
              <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-ink-soft mb-1.5">Content (HTML)</label>
              <textarea name="body" defaultValue={body} rows={10}
                className="w-full bg-white border border-rule rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-olive resize-y" />
            </div>

            <div>
              <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-ink-soft mb-1.5">Estimated Minutes</label>
              <input name="estimated_minutes" type="number" defaultValue={module.estimated_minutes || 3} min={1}
                className="w-32 bg-white border border-rule rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-olive" />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="bg-sienna text-white px-6 py-2.5 rounded-lg text-sm hover:bg-sienna-dk transition">
                Save Changes
              </button>
            </div>
          </form>

          {/* Delete module */}
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

        {/* Quiz section */}
        <div>
          {quiz ? (
            <div className="bg-cream-soft border border-rule rounded-xl p-5 space-y-4">
              <h3 className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-soft">Quiz: {quiz.title}</h3>
              <p className="text-xs text-ink-soft">{(quiz.questions as any[])?.length || 0} questions · Pass score: {quiz.pass_score}%</p>

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
                  <p className="text-[10px] text-ink-soft mt-1">Format: [{"{"}&quot;question&quot;:&quot;...&quot;, &quot;options&quot;:[...], &quot;correct&quot;:0, &quot;explanation&quot;:&quot;...&quot;{"}"}]</p>
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
      </div>
    </div>
  );
}
