"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";
import { effectiveStatus } from "@/lib/status";
import { buildSignedPdf } from "@/lib/pdf";
import { sendSignedCopy, sendAdminNotify } from "@/lib/email";

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1] ?? "";
  return new Uint8Array(Buffer.from(base64, "base64"));
}

export async function submitSignature(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const signerName = String(formData.get("signer_name") ?? "").trim();
  const consentRead = formData.get("consent_read") === "on";
  const consentSign = formData.get("consent_sign") === "on";
  const signatureDataUrl = String(formData.get("signature") ?? "");

  if (!token) redirect("/sign/missing");
  if (!signerName || !consentRead || !consentSign || !signatureDataUrl) {
    redirect(`/sign/${token}?incomplete=1`);
  }

  const db = await createAdminClient();
  const { data: assignment } = await db.from("academy_signing_assignments").select("*").eq("token", token).single();
  if (!assignment) redirect("/sign/missing");

  const st = effectiveStatus(assignment);
  if (st === "signed") redirect(`/sign/${token}/done`);
  if (st === "expired") redirect(`/sign/${token}`);

  const [{ data: staff }, { data: document }] = await Promise.all([
    db.from("academy_staff").select("first_name, last_name, email").eq("id", assignment.staff_id).single(),
    db.from("academy_signing_documents").select("title, doc_type, body, source_file_path, source_file_type").eq("id", assignment.document_id).single(),
  ]);
  if (!staff || !document) redirect("/sign/missing");

  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || null;
  const userAgent = h.get("user-agent");
  const now = new Date().toISOString();

  // Store signature image
  const sigBytes = dataUrlToBytes(signatureDataUrl);
  const sigPath = `signatures/${assignment.id}.png`;
  await db.storage.from("academy-signed").upload(sigPath, sigBytes, { contentType: "image/png", upsert: true });

  // Load original PDF if uploaded
  let sourcePdf: Uint8Array | null = null;
  if (document.source_file_type === "pdf" && document.source_file_path) {
    const { data: blob } = await db.storage.from("academy-uploads").download(document.source_file_path);
    if (blob) sourcePdf = new Uint8Array(await blob.arrayBuffer());
  }

  // Build signed PDF
  const pdfBytes = await buildSignedPdf({
    document: { title: document.title, doc_type: document.doc_type, body: document.body },
    staff,
    assignment: { signer_name: signerName, consent_read: consentRead, consent_sign: consentSign, signed_at: now },
    signaturePng: sigBytes,
    audit: { sentAt: assignment.sent_at, openedAt: assignment.opened_at, signedAt: now, ip, userAgent },
  });

  const pdfPath = `documents/${assignment.id}.pdf`;
  await db.storage.from("academy-signed").upload(pdfPath, pdfBytes, { contentType: "application/pdf", upsert: true });

  // Mark signed
  await db.from("academy_signing_assignments").update({
    status: "signed", signed_at: now, signer_name: signerName,
    signature_path: sigPath, consent_read: consentRead, consent_sign: consentSign, signed_pdf_path: pdfPath,
  }).eq("id", assignment.id);

  await db.from("academy_signing_audit").insert({
    assignment_id: assignment.id, event_type: "signed", actor: signerName, ip_address: ip, user_agent: userAgent,
  });

  // Emails
  await sendSignedCopy(staff.email, `${staff.first_name} ${staff.last_name}`, document.title);
  await sendAdminNotify(document.title, `${staff.first_name} ${staff.last_name}`);

  redirect(`/sign/${token}/done`);
}
