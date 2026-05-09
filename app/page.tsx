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
      <div className="relative w-full rounded-xl overflow-hidden border border-[#D4CEC5] bg-[#F5F1EB]">
        <img
          src={image.previewUrl}
          alt="Design to critique"
          className="w-full max-h-[420px] object-contain"
        />
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-3 bg-[#FAFAF8]/90 backdrop-blur-sm border-t border-[#EAE5DE]">
          <span className="text-sm text-[#6D6861] truncate max-w-[240px] font-[family-name:var(--font-inter)]">
            {image.fileName}
          </span>
          <button
            onClick={onClear}
            className="text-sm font-medium text-[#C05C35] hover:text-[#8C3918] transition-colors ml-4 flex-shrink-0 font-[family-name:var(--font-inter)]"
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
        relative w-full rounded-xl cursor-pointer transition-all duration-200
        border border-dashed select-none
        ${isDragging
          ? "border-[#2D7D62] bg-[#E5F3EE] scale-[1.005]"
          : "border-[#D4CEC5] bg-[#F5F1EB] hover:border-[#2D7D62]"
        }
      `}
    >
      <div className="flex flex-col items-center justify-center gap-[10px] py-[17px] px-[38px]">
        <p className="text-[14px] text-[#6b6764] font-[family-name:var(--font-inter)] leading-normal">
          {isDragging ? "Drop it here" : "Paste, drag or upload a screenshot"}
        </p>
        <p className="text-[10px] text-[#a09890] font-[family-name:var(--font-inter)] leading-normal">
          PNG or JPG, up to 10MB
        </p>
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

// ─── Blocks ───────────────────────────────────────────────────────
function Blocks() {
  const blocks = [
    {
      title: "Add design",
      body: "Screenshot your own design, a competitor, a client's site. No account needed.",
    },
    {
      title: "Add context",
      body: "Tell Candor the overall intent and who the design is for. It makes the feedback sharper.",
    },
    {
      title: "Get the honest read",
      body: "Scored dimensions and a designer's read — the feedback a good mentor gives, not a checklist.",
    },
  ];

  return (
    <section className="flex items-start justify-between py-[60px]">
      {blocks.map((b) => (
        <div key={b.title} className="flex flex-col gap-[10px] w-[200px]">
          <p className="font-[family-name:var(--font-sora)] font-bold text-[17px] text-[#454340] leading-normal">
            {b.title}
          </p>
          <p className="font-[family-name:var(--font-inter)] font-medium text-[15px] text-[#918a80] leading-[22px]">
            {b.body}
          </p>
        </div>
      ))}
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
      className="min-h-screen bg-[#fafaf8]"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Nav />

      {/* Full-page drag overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-30 bg-[#2D7D62]/5 border-2 border-dashed border-[#2D7D62] pointer-events-none" />
      )}

      <main className="pt-16 pb-[60px]">

        {/* ── Centred content column ── */}
        <div className="w-full max-w-[700px] mx-auto px-5 flex flex-col gap-[20px]">

          {/* Hero */}
          <div className="flex flex-col gap-[30px] items-center py-[20px]">

            {/* Illustration */}
            <div className="w-[479px] max-w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/hero-illustration.png?v=2"
                alt="Design review illustration"
                className="w-full h-auto"
                draggable={false}
              />
            </div>

            {/* Heading — breaks out to viewport width */}
            <div className="flex flex-col gap-[10px] items-center text-center">
              <div
                className="relative"
                style={{ width: "100vw", left: "50%", transform: "translateX(-50%)" }}
              >
                <h1
                  className="font-[family-name:var(--font-dm-serif)] text-[52px] text-[#1c1917] leading-[64px] text-center px-4"
                >
                  Honest design critique.<br />No agenda, no filters.
                </h1>
              </div>
              <p className="font-[family-name:var(--font-sora)] text-[17px] text-[#6d6861] leading-normal">
                Get a structured audit across six human dimensions.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-[20px]">

            {/* Upload zone */}
            <UploadZone
              image={image}
              isDragging={isDragging && !image}
              onFileSelect={processFile}
              onClear={() => setImage(null)}
            />

            {/* Intent */}
            <input
              type="text"
              value={primaryIntent}
              onChange={(e) => setPrimaryIntent(e.target.value)}
              placeholder="Optional design intent – e.g. approachable and trustworthy for struggling seniors"
              maxLength={200}
              className="
                w-full px-[16px] py-[15px]
                bg-white border border-[#d4cec5] rounded-[10px]
                font-[family-name:var(--font-inter)] text-[14px] text-[#1c1917] placeholder-[#a09890]
                focus:outline-none focus:border-[#2D7D62] focus:ring-1 focus:ring-[#2D7D62]
                transition-colors
              "
            />

            {/* Context */}
            <input
              type="text"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Optional context – e.g. fintech app for users 55+"
              maxLength={200}
              className="
                w-full px-[16px] py-[15px]
                bg-white border border-[#d4cec5] rounded-[10px]
                font-[family-name:var(--font-inter)] text-[14px] text-[#1c1917] placeholder-[#a09890]
                focus:outline-none focus:border-[#2D7D62] focus:ring-1 focus:ring-[#2D7D62]
                transition-colors
              "
            />

            {/* Deep critique toggle */}
            <div className="flex gap-[10px] items-center">
              <button
                role="switch"
                aria-checked={deepCritique}
                onClick={() => setDeepCritique((v) => !v)}
                className="relative flex-shrink-0 transition-colors duration-200"
                style={{ width: 70, height: 30 }}
              >
                <span
                  className="absolute inset-0 rounded-full transition-colors duration-200"
                  style={{ backgroundColor: deepCritique ? "#2d7d62" : "#E0DDD2" }}
                />
                <span
                  className="absolute top-[2px] left-0 w-[26px] h-[26px] rounded-full bg-white shadow-sm transition-transform duration-200"
                  style={{ transform: deepCritique ? "translateX(2px)" : "translateX(42px)" }}
                />
              </button>
              <p className="font-[family-name:var(--font-inter)] text-[12px] text-[#a09890] leading-normal">
                <span className="font-bold text-[#6d6861]">Deep critique</span>
                {" – usability, cognitive load, and AI patterns, ~2x longer"}
              </p>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-[#C05C35] font-[family-name:var(--font-inter)]">{error}</p>
            )}

            {/* CTA */}
            <div className="px-[90px] pt-[30px]">
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`
                  w-full h-[48px] rounded-[10px]
                  font-[family-name:var(--font-sora)] font-semibold text-[15px]
                  transition-all duration-200
                  ${canSubmit
                    ? "bg-[#2d7d62] text-white hover:bg-[#1D5A46] active:scale-[0.99] cursor-pointer"
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
            </div>

          </div>

          {/* Blocks */}
          <Blocks />

        </div>
      </main>
    </div>
  );
}
