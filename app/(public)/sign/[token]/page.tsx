import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";
import { effectiveStatus } from "@/lib/status";
import { SignFlow } from "./sign-flow";
import { submitSignature } from "./actions";

export const dynamic = "force-dynamic";

function Surface({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-[560px] bg-cream border border-rule rounded-2xl p-9 text-center shadow-[0_14px_40px_rgba(60,48,30,0.07)]">
        {children}
      </div>
    </div>
  );
}

export default async function SignPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ incomplete?: string }>;
}) {
  const { token } = await params;
  const { incomplete } = await searchParams;
  const db = await createAdminClient();

  const { data: assignment } = await db.from("academy_signing_assignments").select("*").eq("token", token).single();

  if (!assignment) {
    return (
      <Surface>
        <h1 className="font-serif text-3xl text-charcoal mb-2 font-light">We could not find that document.</h1>
        <p className="text-ink-soft text-sm">The link may be incorrect. Please ask us to send a fresh one.</p>
      </Surface>
    );
  }

  const status = effectiveStatus(assignment);

  if (status === "expired") {
    return (
      <Surface>
        <h1 className="font-serif text-3xl text-charcoal mb-2 font-light">This link has rested.</h1>
        <p className="text-ink-soft text-sm">For your security, signing links expire after seven days. Let us know and we will send a fresh one.</p>
      </Surface>
    );
  }

  if (status === "signed") {
    return (
      <Surface>
        <h1 className="font-serif text-3xl text-charcoal mb-2 font-light">This document is already signed.</h1>
        <p className="text-ink-soft text-sm">A copy has been sent to your email.</p>
        <p className="font-serif italic text-rosewood mt-5">Come as you are. Leave a little more whole.</p>
      </Surface>
    );
  }

  // Mark as viewed on first open
  if (assignment.status === "sent") {
    const h = await headers();
    const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || null;
    await db.from("academy_signing_assignments").update({ status: "viewed", opened_at: new Date().toISOString() }).eq("id", assignment.id);
    await db.from("academy_signing_audit").insert({
      assignment_id: assignment.id, event_type: "opened", actor: "staff", ip_address: ip, user_agent: h.get("user-agent"),
    });
  }

  const [{ data: staff }, { data: document }] = await Promise.all([
    db.from("academy_staff").select("first_name, last_name, email").eq("id", assignment.staff_id).single(),
    db.from("academy_signing_documents").select("title, doc_type, body").eq("id", assignment.document_id).single(),
  ]);

  return (
    <SignFlow
      token={token}
      staff={staff ?? { first_name: "", last_name: "", email: "" }}
      document={{ ...(document ?? { title: "", doc_type: "", body: "" }), version: "v1.0" }}
      incomplete={incomplete === "1"}
      action={submitSignature}
    />
  );
}
