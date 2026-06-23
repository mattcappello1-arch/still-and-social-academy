"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Props {
  token: string;
  staff: { first_name: string; last_name: string; email: string };
  document: { title: string; doc_type: string; version: string; body: string | null };
  incomplete: boolean;
  action: (formData: FormData) => Promise<void>;
}

function SignaturePad({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  const setup = useCallback(() => {
    const c = ref.current;
    if (!c) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width = rect.width * ratio;
    c.height = rect.height * ratio;
    const ctx = c.getContext("2d")!;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#241F21";
  }, []);

  useEffect(() => {
    setup();
    window.addEventListener("resize", setup);
    return () => window.removeEventListener("resize", setup);
  }, [setup]);

  const pos = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = ref.current!.getBoundingClientRect();
    const p = "touches" in e ? e.touches[0] : (e as React.MouseEvent);
    return { x: p.clientX - rect.left, y: p.clientY - rect.top };
  };
  const start = (e: React.MouseEvent | React.TouchEvent) => { e.preventDefault(); drawing.current = true; last.current = pos(e); };
  const move = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = ref.current!.getContext("2d")!;
    const p = pos(e);
    ctx.beginPath(); ctx.moveTo(last.current!.x, last.current!.y); ctx.lineTo(p.x, p.y); ctx.stroke();
    last.current = p;
  };
  const end = () => { if (!drawing.current) return; drawing.current = false; onChange(ref.current!.toDataURL("image/png")); };
  const clear = () => { const c = ref.current!; c.getContext("2d")!.clearRect(0, 0, c.width, c.height); onChange(""); };

  return (
    <div>
      <canvas ref={ref} className="w-full h-[150px] bg-white border border-rule rounded-lg cursor-crosshair touch-none"
        onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
        onTouchStart={start} onTouchMove={move} onTouchEnd={end} />
      <div className="flex justify-between items-center mt-1.5">
        <span className="text-[11.5px] text-ink-soft">Sign with mouse or finger</span>
        <button type="button" onClick={clear} className="text-sienna underline text-[13px]">Clear</button>
      </div>
    </div>
  );
}

const labelCls = "block font-mono text-[9.5px] tracking-[0.18em] uppercase text-olive mb-1.5";

export function SignFlow({ token, staff, document, incomplete, action }: Props) {
  const [step, setStep] = useState<"welcome" | "review" | "sign">(incomplete ? "sign" : "welcome");
  const [name, setName] = useState(`${staff.first_name} ${staff.last_name}`);
  const [read, setRead] = useState(false);
  const [agree, setAgree] = useState(false);
  const [sig, setSig] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = read && agree && name.trim().length > 1 && !!sig;

  return (
    <div className="min-h-screen bg-cream">
      <header className="flex justify-between items-center px-5 py-4 border-b border-rule bg-cream">
        <span className="font-serif font-light tracking-[0.16em] text-charcoal text-sm uppercase">Still & Social</span>
        <span className="font-mono text-xs text-ink-soft">{document.version}</span>
      </header>

      <div className="flex flex-col items-center justify-center px-5 py-10">
        <div className="w-full max-w-[560px] bg-cream border border-rule rounded-2xl p-9 shadow-[0_14px_40px_rgba(60,48,30,0.07)]">
          {step === "welcome" && (
            <>
              <p className="font-mono text-[10.5px] tracking-[0.22em] uppercase text-sienna">For {staff.first_name} {staff.last_name}</p>
              <h1 className="font-serif text-[34px] text-charcoal mt-1.5 mb-2 font-light">Welcome.</h1>
              <p className="text-ink-soft text-sm max-w-[46ch] mb-5">
                We are glad you are here. Below is your {document.doc_type.toLowerCase()}. Take your time. Read it gently. Sign when you are ready.
              </p>
              <div className="grid grid-cols-2 gap-4 p-4 bg-cream-soft rounded-xl mb-6">
                <div><span className={labelCls}>Document</span><span className="text-sm text-ink">{document.title}</span></div>
                <div><span className={labelCls}>Prepared for</span><span className="text-sm text-ink">{staff.first_name} {staff.last_name}</span></div>
              </div>
              <button onClick={() => setStep("review")} className="w-full bg-sienna text-white rounded-lg py-3 text-sm font-medium hover:bg-sienna-dk transition">
                Read the document
              </button>
            </>
          )}

          {step === "review" && (
            <>
              <p className="font-mono text-[10.5px] tracking-[0.22em] uppercase text-sienna">{document.doc_type}</p>
              <h1 className="font-serif text-[27px] text-charcoal mt-1 mb-4 font-light">{document.title}</h1>
              <div className="font-serif text-[17px] leading-relaxed text-ink max-h-[44vh] overflow-y-auto pr-1">
                {(document.body ?? "This document was provided as an uploaded file. Please review the attached pages, then continue to sign.")
                  .split("\n")
                  .map((p, i) => (p.trim() ? <p key={i} className="mb-3.5">{p}</p> : <br key={i} />))}
              </div>
              <div className="flex justify-between items-center gap-3 mt-6">
                <button onClick={() => setStep("welcome")} className="text-ink-soft text-sm hover:text-sienna">Back</button>
                <button onClick={() => setStep("sign")} className="bg-sienna text-white rounded-lg px-6 py-3 text-sm font-medium hover:bg-sienna-dk transition">
                  Continue to sign
                </button>
              </div>
            </>
          )}

          {step === "sign" && (
            <form action={action} onSubmit={() => setSubmitting(true)}>
              <input type="hidden" name="token" value={token} />
              <input type="hidden" name="signature" value={sig} />
              <p className="font-mono text-[10.5px] tracking-[0.22em] uppercase text-sienna">Your details</p>
              <h1 className="font-serif text-[27px] text-charcoal mt-1 mb-5 font-light">A few quiet steps</h1>

              <label className="block mb-4">
                <span className={labelCls}>Your full legal name</span>
                <input name="signer_name" value={name} onChange={(e) => setName(e.target.value)} required
                  className="w-full bg-white border border-rule rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-olive" />
              </label>
              <label className="block mb-4">
                <span className={labelCls}>Email on file</span>
                <input value={staff.email} disabled className="w-full bg-cream-soft border border-rule rounded-lg px-3 py-2.5 text-sm text-ink-soft" />
              </label>

              <div className="my-4 space-y-3">
                <label className="flex gap-3 items-start text-sm text-ink-soft cursor-pointer">
                  <input type="checkbox" name="consent_read" checked={read} onChange={(e) => setRead(e.target.checked)} className="mt-1 w-[17px] h-[17px] accent-olive shrink-0" />
                  <span>I confirm I have read and understood this document.</span>
                </label>
                <label className="flex gap-3 items-start text-sm text-ink-soft cursor-pointer">
                  <input type="checkbox" name="consent_sign" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 w-[17px] h-[17px] accent-olive shrink-0" />
                  <span>I agree to sign this document electronically.</span>
                </label>
              </div>

              <div className="mb-4">
                <span className={labelCls}>Your signature</span>
                <SignaturePad value={sig} onChange={setSig} />
              </div>

              {incomplete && <p className="text-rosewood text-[13px] mb-3 text-center">Please complete every field before submitting.</p>}

              <div className="flex justify-between items-center gap-3">
                <button type="button" onClick={() => setStep("review")} className="text-ink-soft text-sm hover:text-sienna">Back</button>
                <button type="submit" disabled={!canSubmit || submitting}
                  className="bg-sienna text-white rounded-lg px-6 py-3 text-sm font-medium disabled:opacity-50 hover:bg-sienna-dk transition">
                  {submitting ? "Signing..." : "Sign and submit"}
                </button>
              </div>
              {!canSubmit && <p className="text-[11.5px] text-ink-soft text-center mt-3">Complete your name, both confirmations, and your signature to continue.</p>}
            </form>
          )}
        </div>
        <p className="font-serif italic text-rosewood mt-7">Come as you are. Leave a little more whole.</p>
      </div>
    </div>
  );
}
