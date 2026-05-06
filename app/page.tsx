"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────
type ImageState = {
  base64: string;
  mediaType: "image/png" | "image/jpeg" | "image/webp";
  previewUrl: string;
  fileName: string;
};

// ─── How it works flyover ─────────────────────────────────────────
function HowItWorksFlyover({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const pipeline = [
    {
      n: "1",
      label: "Image capture",
      detail: "You paste, drag, or browse a screenshot. The browser reads it as a File object and converts it to a base64 data URL entirely in-memory — no upload to any third-party service at this stage.",
    },
    {
      n: "2",
      label: "Prompt assembly",
      detail: "Your context, primary intent, and critique mode are merged with a structured system prompt. Standard mode targets 6 universal dimensions. Deep mode expands to 11, adding usability heuristics, cognitive load, AI transparency & trust, AI control & agency, and interaction & affordance.",
    },
    {
      n: "3",
      label: "Vision API call",
      detail: "The base64 image and assembled prompt are sent to Claude Sonnet 4.6 (Anthropic) via the Messages API. Claude receives the image as a multimodal content block and processes pixels and text simultaneously in a single inference pass.",
    },
    {
      n: "4",
      label: "Structured JSON output",
      detail: "Claude returns a strict JSON object — overall score, verdict, per-dimension findings, suggestions, and observation bullets. The server enforces an 8 000-token budget for standard mode and 16 000 for deep mode to ensure complete output without truncation.",
    },
    {
      n: "5",
      label: "Client-side render",
      detail: "The parsed result is written to sessionStorage — nothing is persisted server-side. The results page reads it immediately and renders scores, the Designer's Read, and expandable dimension cards. Closing the tab clears everything.",
    },
  ];

  const meta = [
    {
      label: "Model",
      title: "Claude Sonnet 4.6",
      sub: "Anthropic · multimodal vision",
      rows: [
        { k: "Standard", v: "8 000 token budget" },
        { k: "Deep critique", v: "16 000 token budget" },
      ],
    },
    {
      label: "Privacy",
      title: "No server-side storage",
      sub: "Images and results live in your browser session only. Nothing is logged, indexed, or retained after the request completes.",
    },
    {
      label: "Standard mode",
      title: "6 dimensions · ~30–60 s",
      sub: "Clarity & hierarchy, visual trust, audience resonance, emotional tone, message legibility, inclusivity signals.",
    },
    {
      label: "Deep critique",
      title: "11 dimensions · ~60–90 s",
      sub: "Adds usability heuristics, cognitive load, AI transparency & trust, AI control & agency, and interaction & affordance — each with weighted sub-heuristics.",
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/25 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 pointer-events-none">
        <div
          className="relative w-full max-w-[640px] max-h-[90vh] bg-[#FAFAF8] rounded-2xl shadow-2xl pointer-events-auto flex flex-col overflow-hidden"
          role="dialog"
          aria-label="How Candor works"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-8 pt-8 pb-6 border-b border-[#EAE5DE] flex-shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-serif text-[30px] text-[#1C1917] tracking-tight leading-none">
                  How Candor works
                </h2>
                <p className="text-[13px] text-[#A09890] mt-1.5">Technical overview</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full hover:bg-[#EAE5DE] text-[#A09890] hover:text-[#1C1917] transition-colors"
                aria-label="Close"
              >
                <svg viewBox="0 0 16 16" width="13" height="13" fill="none">
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1">

            {/* Pipeline */}
            <div className="px-8 py-7 border-b border-[#EAE5DE]">
              <p className="text-[10px] font-semibold tracking-widest uppercase text-[#A09890] mb-6">
                The pipeline
              </p>
              <div>
                {pipeline.map((step, i) => (
                  <div key={step.n} className="flex gap-4">
                    {/* Indicator + connector */}
                    <div className="flex flex-col items-center flex-shrink-0 w-7">
                      <div className="w-7 h-7 rounded-full bg-[#1C1917] text-white text-[11px] font-semibold flex items-center justify-center flex-shrink-0">
                        {step.n}
                      </div>
                      {i < pipeline.length - 1 && (
                        <div className="w-px flex-1 bg-[#D4CEC5] my-1.5" style={{ minHeight: 18 }} />
                      )}
                    </div>
                    {/* Text */}
                    <div className={i < pipeline.length - 1 ? "pb-5" : ""}>
                      <p className="text-[13px] font-semibold text-[#1C1917] leading-none mb-1.5 pt-[5px]">
                        {step.label}
                      </p>
                      <p className="text-[13px] text-[#6D6861] leading-[1.65]">
                        {step.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Meta grid */}
            <div className="px-8 py-7 grid grid-cols-2 gap-x-8 gap-y-7">
              {meta.map((m) => (
                <div key={m.label}>
                  <p className="text-[10px] font-semibold tracking-widest uppercase text-[#A09890] mb-2.5">
                    {m.label}
                  </p>
                  <p className="text-[13px] font-semibold text-[#1C1917] leading-snug">{m.title}</p>
                  <p className="text-[12px] text-[#6D6861] mt-1 leading-relaxed">{m.sub}</p>
                  {"rows" in m && m.rows && (
                    <div className="mt-3 flex flex-col gap-1.5">
                      {m.rows.map((r) => (
                        <div key={r.k} className="flex items-center justify-between text-[12px]">
                          <span className="text-[#6D6861]">{r.k}</span>
                          <span className="font-mono text-[#1C1917] text-[11px]">{r.v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>

          {/* Footer */}
          <div className="px-8 py-4 border-t border-[#EAE5DE] flex-shrink-0 flex items-center justify-between">
            <p className="text-[11px] text-[#A09890]">
              Powered by <a href="https://anthropic.com" target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-[#6D6861] transition-colors">Anthropic</a>
            </p>
            <button
              onClick={onClose}
              className="text-[13px] font-medium text-[#1D5A46] bg-[#E5F3EE] border border-[#2D7D62] rounded-lg px-4 py-1.5 hover:bg-[#D0EDDF] transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── About flyover ────────────────────────────────────────────────
function AboutFlyover({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/25 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 pointer-events-none">
        <div
          className="relative w-full max-w-[480px] bg-[#FAFAF8] rounded-2xl shadow-2xl pointer-events-auto overflow-hidden"
          role="dialog"
          aria-label="About Candor"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-8 pt-8 pb-6 border-b border-[#EAE5DE] flex items-start justify-between gap-4">
            <h2 className="font-serif text-[30px] text-[#1C1917] tracking-tight leading-none">
              About
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full hover:bg-[#EAE5DE] text-[#A09890] hover:text-[#1C1917] transition-colors"
              aria-label="Close"
            >
              <svg viewBox="0 0 16 16" width="13" height="13" fill="none">
                <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="px-8 py-8">
            <p className="text-[16px] text-[#1C1917] leading-[1.7]">
              I built Candor because I kept noticing the same gap — teams doing good work but missing a structured way to pressure-test it before it reached stakeholders. The tool reflects how I actually review design: six specific dimensions, a direct read, and concrete next steps. The AI does the analysis. The framework is mine.
            </p>

            <div className="mt-8 pt-6 border-t border-[#EAE5DE]">
              <p className="text-[14px] font-semibold text-[#1C1917]">Christopher Kobar</p>
              <a
                href="https://chriskobar.com"
                target="_blank"
                rel="noreferrer"
                className="text-[13px] text-[#2D7D62] hover:text-[#1D5A46] underline underline-offset-2 transition-colors"
              >
                chriskobar.com
              </a>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 border-t border-[#EAE5DE] flex justify-end">
            <button
              onClick={onClose}
              className="text-[13px] font-medium text-[#1D5A46] bg-[#E5F3EE] border border-[#2D7D62] rounded-lg px-4 py-1.5 hover:bg-[#D0EDDF] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────
function Nav() {
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-20 h-16 bg-[#FAFAF8] border-b border-[#EAE5DE] flex items-center px-8 md:px-14">
        <span className="font-serif text-[22px] text-[#1C1917] tracking-tight">
          Candor
        </span>
        <div className="ml-auto flex items-center gap-8">
          <button
            onClick={() => setShowHowItWorks(true)}
            className="text-sm text-[#6D6861] hover:text-[#1C1917] transition-colors hidden md:block"
          >
            How it works
          </button>
          <button
            onClick={() => setShowAbout(true)}
            className="text-sm text-[#6D6861] hover:text-[#1C1917] transition-colors hidden md:block"
          >
            About
          </button>
        </div>
      </nav>
      {showHowItWorks && (
        <HowItWorksFlyover onClose={() => setShowHowItWorks(false)} />
      )}
      {showAbout && (
        <AboutFlyover onClose={() => setShowAbout(false)} />
      )}
    </>
  );
}

// ─── Upload Zone ──────────────────────────────────────────────────
function UploadZone({
  image,
  isDragging,
  onFileSelect,
  onClear,
}: {
  image: ImageState | null;
  isDragging: boolean;
  onFileSelect: (file: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  // If image loaded — show preview
  if (image) {
    return (
      <div className="relative w-full rounded-2xl overflow-hidden border border-[#D4CEC5] bg-[#F5F1EB]">
        {/* Preview */}
        <img
          src={image.previewUrl}
          alt="Design to critique"
          className="w-full max-h-[420px] object-contain"
        />
        {/* Overlay bar */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-3 bg-[#FAFAF8]/90 backdrop-blur-sm border-t border-[#EAE5DE]">
          <span className="text-sm text-[#6D6861] truncate max-w-[240px]">
            {image.fileName}
          </span>
          <button
            onClick={onClear}
            className="text-sm font-medium text-[#C05C35] hover:text-[#8C3918] transition-colors ml-4 flex-shrink-0"
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  // Empty state — paste / drag / browse
  return (
    <div
      onClick={() => inputRef.current?.click()}
      className={`
        relative w-full rounded-2xl cursor-pointer transition-all duration-200
        border-2 border-dashed
        ${isDragging
          ? "border-[#2D7D62] bg-[#E5F3EE] scale-[1.01]"
          : "border-[#D4CEC5] bg-[#F5F1EB] hover:border-[#2D7D62] hover:bg-[#EDF7F3]"
        }
      `}
      style={{ minHeight: 260 }}
    >
      <div className="flex flex-col items-center justify-center gap-3 py-14 px-6 select-none">
        {/* Icon */}
        <div className={`
          w-12 h-12 rounded-full flex items-center justify-center
          border-[1.5px] transition-colors duration-200
          ${isDragging ? "bg-[#2D7D62] border-[#2D7D62]" : "bg-[#E5F3EE] border-[#2D7D62]"}
        `}>
          <span className={`text-sm font-semibold transition-colors ${isDragging ? "text-white" : "text-[#2D7D62]"}`}>
            ⌘V
          </span>
        </div>

        <div className="text-center">
          <p className="text-[17px] font-semibold text-[#1C1917] leading-snug">
            {isDragging ? "Drop it here" : "Paste your screenshot"}
          </p>
          <p className="text-[14px] text-[#A09890] mt-1">
            or drag a file, or{" "}
            <span className="text-[#2D7D62] underline underline-offset-2">browse</span>
          </p>
          <p className="text-[12px] text-[#A09890] mt-1">PNG or JPG up to 10MB</p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file);
        }}
      />
    </div>
  );
}

// ─── How it works strip ───────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { n: "01", title: "Paste or upload", body: "Screenshot any design — your own work, a competitor, a client's site. No account needed." },
    { n: "02", title: "Add context", body: "Tell Candor who the design is for. Optional, but it makes the audience resonance feedback sharper." },
    { n: "03", title: "Get the honest read", body: "Six scored dimensions plus a Designer's Read — the kind of feedback a good mentor gives, not a checklist." },
  ];

  return (
    <section id="how" className="mt-24 mb-16 px-0">
      <p className="text-xs font-medium tracking-widest uppercase text-[#A09890] mb-8">
        How it works
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((s) => (
          <div key={s.n} className="flex flex-col gap-3">
            <span className="text-xs text-[#A09890] font-medium">{s.n}</span>
            <p className="text-[15px] font-semibold text-[#1C1917]">{s.title}</p>
            <p className="text-[14px] text-[#6D6861] leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────
export default function LandingPage() {
  const router = useRouter();
  const [image, setImage] = useState<ImageState | null>(null);
  const [context, setContext] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [primaryIntent, setPrimaryIntent] = useState("");
  const [deepCritique, setDeepCritique] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dragCounterRef = useRef(0);

  // ── Process a File object into ImageState ──
  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload a PNG, JPG, or WebP image.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be under 10MB.");
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      // dataUrl = "data:image/png;base64,XXXX..."
      const [meta, base64] = dataUrl.split(",");
      const mediaType = meta.split(":")[1].split(";")[0] as ImageState["mediaType"];
      setImage({
        base64,
        mediaType,
        previewUrl: dataUrl,
        fileName: file.name,
      });
    };
    reader.readAsDataURL(file);
  }, []);

  // ── Paste handler ──
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) processFile(file);
          break;
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [processFile]);

  // ── Drag handlers ──
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current += 1;
    if (dragCounterRef.current === 1) setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current === 0) setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current = 0;
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  // ── Submit ──
  const handleSubmit = async () => {
    if (!image) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: image.base64,
          mediaType: image.mediaType,
          context: context.trim() || undefined,
          primaryIntent: primaryIntent.trim() || undefined,
          deepCritique,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong.");
      }

      const result = await res.json();

      // Store result and image preview in sessionStorage for results page
      sessionStorage.setItem("candor_result", JSON.stringify(result));
      sessionStorage.setItem("candor_image", image.previewUrl);
      sessionStorage.setItem("candor_filename", image.fileName);

      router.push("/results");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
      setIsLoading(false);
    }
  };

  const canSubmit = !!image && !isLoading;

  return (
    <div
      className="min-h-screen bg-[#FAFAF8]"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Nav />

      {/* Full-page drag overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-30 bg-[#2D7D62]/5 border-4 border-dashed border-[#2D7D62] pointer-events-none rounded-none" />
      )}

      {/* Main content */}
      <main className="pt-16">
        <div className="max-w-2xl mx-auto px-6 md:px-8">

          {/* Hero */}
          <div className="pt-16 pb-10">
            <h1 className="font-serif text-[44px] md:text-[56px] text-[#1C1917] leading-[1.15] tracking-tight">
              Honest design critique.<br />
              <span className="text-[#6D6861]">No agenda, no filters.</span>
            </h1>
            <p className="mt-5 text-[17px] text-[#6D6861] leading-relaxed max-w-lg">
              Paste or upload a design. Get a structured audit across six human
              dimensions — clarity, trust, audience fit, emotion, message, and
              inclusivity.
            </p>
          </div>

          {/* Upload zone */}
          <UploadZone
            image={image}
            isDragging={isDragging && !image}
            onFileSelect={processFile}
            onClear={() => setImage(null)}
          />

          {/* Primary Design Intent */}
          <div className="mt-3">
            <label className="block text-xs font-medium text-[#6D6861] mb-1.5 ml-1">
              Primary Design Intent
              <span className="text-[#A09890] font-normal ml-1">— shapes the lead score</span>
            </label>
            <input
              type="text"
              value={primaryIntent}
              onChange={(e) => setPrimaryIntent(e.target.value)}
              placeholder="e.g. This should feel approachable and trustworthy for seniors"
              maxLength={200}
              className="
                w-full h-[48px] px-4
                bg-white border border-[#D4CEC5] rounded-xl
                text-[14px] text-[#1C1917] placeholder-[#A09890]
                focus:outline-none focus:border-[#2D7D62] focus:ring-1 focus:ring-[#2D7D62]
                transition-colors
              "
            />
          </div>

          {/* Context input */}
          <div className="mt-2">
            <input
              type="text"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Additional context (optional) — audience, platform, stage"
              maxLength={200}
              className="
                w-full h-[44px] px-4
                bg-[#F5F1EB] border border-transparent rounded-xl
                text-[13px] text-[#1C1917] placeholder-[#A09890]
                focus:outline-none focus:border-[#D4CEC5] focus:ring-0
                transition-colors
              "
            />
          </div>

          {/* Deep critique toggle */}
          <div className="mt-3 flex items-start gap-3 px-1">
            <button
              role="switch"
              aria-checked={deepCritique}
              onClick={() => setDeepCritique((v) => !v)}
              className={`
                mt-0.5 flex-shrink-0 w-9 h-5 rounded-full border transition-colors duration-200 relative
                ${deepCritique
                  ? "bg-[#2D7D62] border-[#2D7D62]"
                  : "bg-[#E5E0D8] border-[#D4CEC5]"
                }
              `}
            >
              <span className={`
                absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200
                ${deepCritique ? "translate-x-4" : "translate-x-0.5"}
              `} />
            </button>
            <div>
              <p className="text-[13px] font-medium text-[#1C1917] leading-snug">
                Deep critique
              </p>
              <p className="text-[12px] text-[#A09890] leading-relaxed mt-0.5">
                Adds usability heuristics, cognitive load, AI &amp; agentic patterns, and interaction analysis — takes ~2× longer
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="mt-3 text-sm text-[#C05C35]">{error}</p>
          )}

          {/* CTA */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`
              mt-4 w-full h-[52px] rounded-xl
              text-[16px] font-semibold tracking-tight
              transition-all duration-200
              ${canSubmit
                ? "bg-[#2D7D62] text-white hover:bg-[#1D5A46] active:scale-[0.99] cursor-pointer"
                : "bg-[#D4CEC5] text-[#A09890] cursor-not-allowed"
              }
            `}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                {deepCritique ? "Running deep critique…" : "Running critique…"}
              </span>
            ) : (
              deepCritique ? "Run Deep Critique" : "Run Critique"
            )}
          </button>

          {/* Reassurance */}
          <p className="mt-4 text-center text-[13px] text-[#A09890]">
            No account needed. Results appear in seconds.
          </p>

          {/* How it works */}
          <HowItWorks />

        </div>
      </main>
    </div>
  );
}
