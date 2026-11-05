"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { AuditResult, DimensionScore } from "@/types/audit";

// ─── Design tokens ────────────────────────────────────────────────
import { c } from "@/lib/tokens";

// ─── Helpers ──────────────────────────────────────────────────────
function scoreColor(score: number) {
  if (score >= 7.5) return c.accentBold;
  if (score >= 6)   return c.amber;
  return c.warmBold;
}
function scoreBg(score: number) {
  if (score >= 7.5) return c.accentSubtle;
  if (score >= 6)   return c.amberSubtle;
  return c.warmSubtle;
}
function scoreTextColor(score: number) {
  if (score >= 7.5) return c.accentText;
  if (score >= 6)   return c.amber;
  return c.warmBold;
}

// ─── Nav ──────────────────────────────────────────────────────────
function Nav({ fileName, onNewAudit }: { fileName: string; onNewAudit: () => void }) {
  return (
    <nav
      className="sticky top-0 z-20 bg-[#FAFAF8] border-b border-[#EAE5DE]"
      style={{ backdropFilter: "blur(8px)" }}
    >
      <div className="max-w-4xl mx-auto px-6 md:px-8 h-16 flex items-center justify-between">
        <span className="font-serif text-[22px] text-[#1C1917] tracking-tight">
          Candor
        </span>
        {/* Subject */}
        <div className="hidden md:flex items-center gap-2 text-sm absolute left-1/2 -translate-x-1/2">
          <span className="text-[#A09890]">Critique of</span>
          <span className="font-medium text-[#1C1917] max-w-[260px] truncate">{fileName}</span>
        </div>
        <button
          onClick={onNewAudit}
          className="text-sm font-medium text-[#1D5A46] bg-[#E5F3EE] border border-[#2D7D62] rounded-lg px-3 py-1.5 hover:bg-[#D0EDDF] transition-colors"
        >
          New critique
        </button>
      </div>
      {/* Mobile subject bar */}
      <div className="md:hidden px-6 pb-2 flex items-center gap-1 text-xs">
        <span className="text-[#A09890]">Critique of</span>
        <span className="font-medium text-[#1C1917] truncate">{fileName}</span>
      </div>
    </nav>
  );
}

// ─── Score hero ───────────────────────────────────────────────────
function ScoreHero({
  score,
  verdict,
  intentScore,
  primaryIntent,
  dimensions,
}: {
  score: number;
  verdict: string;
  intentScore?: number;
  primaryIntent?: string;
  dimensions: DimensionScore[];
}) {
  const leadScore   = intentScore ?? score;
  const hasIntent   = intentScore !== undefined;

  return (
    <div className="flex flex-col md:flex-row md:items-start gap-8 pt-10 pb-8 border-b border-[#EAE5DE]">
      {/* Score block */}
      <div className="flex flex-col items-start gap-3 flex-shrink-0">
        {/* Lead score — large */}
        <span
          className="font-serif leading-none tracking-tight text-[#1C1917]"
          style={{ fontSize: "clamp(72px, 10vw, 96px)" }}
        >
          {leadScore.toFixed(1)}
        </span>

        {/* Verdict pill */}
        <span
          className="text-xs font-medium px-3 py-1 rounded-md"
          style={{
            background: scoreBg(leadScore),
            color: scoreTextColor(leadScore),
          }}
        >
          {verdict}
        </span>

        {/* Dual score — universal, deprioritized */}
        {hasIntent && (
          <div className="flex flex-col gap-0.5 mt-1">
            <span className="text-[11px] text-[#A09890] leading-none">
              Universal score
            </span>
            <span className="text-[22px] font-medium text-[#A09890] leading-none tracking-tight">
              {score.toFixed(1)}
            </span>
          </div>
        )}

        {/* Intent label */}
        {hasIntent && primaryIntent && (
          <p className="text-[11px] text-[#A09890] leading-snug max-w-[160px] mt-1 italic">
            Intent: &ldquo;{primaryIntent}&rdquo;
          </p>
        )}
      </div>

      {/* Dimension bars */}
      <div className="flex flex-col gap-[18px] flex-1 md:pt-3">
        {dimensions.map((d) => (
          <div key={d.label} className="flex items-center gap-3">
            <span className="text-[13px] text-[#6D6861] w-[172px] flex-shrink-0 leading-tight">
              {d.label}
            </span>
            {/* Track */}
            <div className="flex-1 h-[6px] bg-[#EAE5DE] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${d.score * 10}%`,
                  background: scoreColor(d.score),
                }}
              />
            </div>
            <span
              className="text-[13px] font-medium w-8 text-right flex-shrink-0"
              style={{ color: scoreColor(d.score) }}
            >
              {d.score.toFixed(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Designer's Read ──────────────────────────────────────────────
function DesignersRead({ text }: { text: string }) {
  return (
    <div className="py-8 border-b border-[#EAE5DE]">
      <p className="text-xs font-medium tracking-widest uppercase text-[#A09890] mb-4">
        Designer&apos;s read
      </p>
      <p
        className="text-[#1C1917] font-medium"
        style={{ fontSize: 20, lineHeight: "134%" }}
      >
        {text}
      </p>
    </div>
  );
}

// ─── Detail panel (slide-in from right) ───────────────────────────
function DetailPanel({
  dim,
  onClose,
}: {
  dim: DimensionScore | null;
  onClose: () => void;
}) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const visible = !!dim;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-30 bg-black/20 transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none" }}
      />

      {/* Panel */}
      <div
        className="fixed top-0 right-0 bottom-0 z-40 w-full max-w-[480px] bg-[#FAFAF8] shadow-2xl flex flex-col transition-transform duration-300 ease-out"
        style={{ transform: visible ? "translateX(0)" : "translateX(100%)" }}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#EAE5DE] flex-shrink-0">
          <div className="flex items-center gap-3">
            {dim && (
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-md"
                style={{ background: scoreBg(dim.score), color: scoreTextColor(dim.score) }}
              >
                {dim.score.toFixed(1)}
              </span>
            )}
            <span className="text-[15px] font-semibold text-[#1C1917]">
              {dim?.label}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[#A09890] hover:text-[#1C1917] transition-colors p-1 rounded-lg hover:bg-[#F5F1EB]"
            aria-label="Close"
          >
            <svg viewBox="0 0 16 16" width="16" height="16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Panel body — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-7">
          {dim && (
            <>
              {/* What we observed */}
              <section>
                <p className="text-xs font-medium tracking-widest uppercase text-[#A09890] mb-3">
                  What we observed
                </p>
                <p className="text-[14px] text-[#1C1917] leading-[1.65]">
                  {dim.finding}
                </p>
              </section>

              {/* Point-by-point breakdown */}
              {dim.points && dim.points.length > 0 && (
                <section>
                  <p className="text-xs font-medium tracking-widest uppercase text-[#A09890] mb-3">
                    Breakdown
                  </p>
                  <ul className="flex flex-col gap-3">
                    {dim.points.map((point, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span
                          className="mt-[5px] w-[6px] h-[6px] rounded-full flex-shrink-0"
                          style={{ background: scoreColor(dim.score) }}
                        />
                        <p className="text-[13px] text-[#6D6861] leading-[1.6]">{point}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Suggestion */}
              <section className="bg-[#F5F1EB] rounded-xl p-5">
                <p className="text-xs font-medium tracking-widest uppercase text-[#A09890] mb-3">
                  Suggestion
                </p>
                <p className="text-[14px] text-[#1C1917] leading-[1.65]">
                  {dim.suggestion}
                </p>
              </section>

              {/* Score context */}
              <section>
                <p className="text-xs font-medium tracking-widest uppercase text-[#A09890] mb-3">
                  What this score means
                </p>
                <p className="text-[13px] text-[#6D6861] leading-[1.6]">
                  {dim.score >= 8
                    ? "This dimension is working well. Maintain it while refining other areas."
                    : dim.score >= 6.5
                    ? "Solid foundation with specific gaps. Targeted improvements here will have clear impact."
                    : dim.score >= 5
                    ? "There are real issues affecting users in this area. This should be a priority to address."
                    : "This dimension needs significant attention. Consider making it a primary focus of your next design iteration."}
                </p>
              </section>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Dimension card ───────────────────────────────────────────────
function DimCard({
  dim,
  index,
  onDeepDive,
}: {
  dim: DimensionScore;
  index: number;
  onDeepDive: (dim: DimensionScore) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="bg-white border border-[#EAE5DE] rounded-2xl overflow-hidden transition-shadow hover:shadow-sm"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Header row — always visible, clickable */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left"
      >
        {/* Score pill */}
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-md flex-shrink-0"
          style={{
            background: scoreBg(dim.score),
            color: scoreTextColor(dim.score),
          }}
        >
          {dim.score.toFixed(1)}
        </span>

        {/* Label */}
        <span className="text-[14px] font-semibold text-[#1C1917] flex-1">
          {dim.label}
        </span>

        {/* Chevron */}
        <svg
          className={`w-4 h-4 text-[#A09890] flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 16 16" fill="none"
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Finding — always visible */}
      <div className="px-5 pb-3">
        <p className="text-[13px] text-[#6D6861] leading-[1.6]">
          {dim.finding}
        </p>
      </div>

      {/* Suggestion — expands on click */}
      {open && (
        <div className="px-5 pb-4 pt-3 border-t border-[#EAE5DE]">
          <p className="text-xs font-medium tracking-widest uppercase text-[#A09890] mb-2">
            Suggestion
          </p>
          <p className="text-[13px] text-[#1C1917] leading-[1.6]">
            {dim.suggestion}
          </p>
        </div>
      )}

      {/* Action row */}
      <div className="px-5 pb-4 flex items-center gap-4">
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="text-[12px] font-medium text-[#2D7D62] hover:text-[#1D5A46] transition-colors"
          >
            See suggestion +
          </button>
        )}
        <button
          onClick={() => onDeepDive(dim)}
          className="text-[12px] font-medium text-[#A09890] hover:text-[#1C1917] transition-colors ml-auto"
        >
          Deep dive →
        </button>
      </div>
    </div>
  );
}

// ─── Image panel ──────────────────────────────────────────────────
function ImagePanel({ src }: { src: string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="mb-8">
      <p className="text-xs font-medium tracking-widest uppercase text-[#A09890] mb-3">
        Design reviewed
      </p>
      <div
        className={`relative rounded-2xl overflow-hidden border border-[#EAE5DE] bg-[#F5F1EB] cursor-pointer transition-all ${expanded ? "" : "max-h-[220px]"}`}
        onClick={() => setExpanded((e) => !e)}
      >
        <img src={src} alt="Reviewed design" className="w-full object-cover" />
        {!expanded && (
          <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#F5F1EB] to-transparent flex items-end justify-center pb-3">
            <span className="text-xs font-medium text-[#6D6861]">Click to expand</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-[#EAE5DE] border-t-[#2D7D62] animate-spin" />
        <p className="text-sm text-[#A09890]">Reading your design…</p>
      </div>
    </div>
  );
}

// ─── Export utilities ─────────────────────────────────────────────
function aiSurfaceLabel(s: NonNullable<AuditResult["aiSurface"]>): string {
  return s.detected
    ? `AI features detected: ${s.evidence.join("; ")}`
    : "No AI features visible · AI dimensions scored on system transparency and control";
}

function buildMarkdown(result: AuditResult, fileName: string, imageSrc?: string): string {
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
  const leadScore = result.intentScore ?? result.overallScore;
  const lines: string[] = [];

  lines.push(`# Candor Audit Report`);
  lines.push(`**File:** ${fileName}  `);
  lines.push(`**Date:** ${date}  `);
  lines.push(``);
  if (imageSrc) {
    lines.push(`![${fileName}](${imageSrc})`);
    lines.push(``);
  }

  if (result.primaryIntent) {
    lines.push(`**Primary Design Intent:** ${result.primaryIntent}  `);
    lines.push(``);
  }

  lines.push(`## Score: ${leadScore.toFixed(1)} — ${result.verdict}`);
  if (result.intentScore !== undefined) {
    lines.push(`*Universal score: ${result.overallScore.toFixed(1)}*`);
  }
  lines.push(``);

  if (result.intentAlignment) {
    lines.push(`### Intent Alignment`);
    lines.push(result.intentAlignment);
    lines.push(``);
  }

  lines.push(`### Designer's Read`);
  lines.push(`> ${result.designersRead}`);
  lines.push(``);

  lines.push(`---`);
  lines.push(``);
  lines.push(`## ${result.deepCritique ? "Eleven" : "Six"} Dimensions`);
  lines.push(``);

  if (result.aiSurface) {
    lines.push(`*${aiSurfaceLabel(result.aiSurface)}*`);
    lines.push(``);
  }

  for (const d of result.dimensions) {
    lines.push(`### ${d.label} — ${d.score.toFixed(1)}`);
    lines.push(``);
    lines.push(`**Finding:** ${d.finding}`);
    lines.push(``);
    if (d.points?.length) {
      lines.push(`**Breakdown:**`);
      for (const p of d.points) lines.push(`- ${p}`);
      lines.push(``);
    }
    lines.push(`**Suggestion:** ${d.suggestion}`);
    lines.push(``);
  }

  lines.push(`---`);
  lines.push(`*Generated by [Candor](https://candor.design)*`);

  return lines.join("\n");
}

function buildPlainText(result: AuditResult, fileName: string): string {
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
  const leadScore = result.intentScore ?? result.overallScore;
  const lines: string[] = [];
  const rule = "─".repeat(52);

  lines.push(`CANDOR AUDIT REPORT`);
  lines.push(rule);
  lines.push(`File: ${fileName}`);
  lines.push(`Date: ${date}`);
  if (result.primaryIntent) lines.push(`Primary Intent: ${result.primaryIntent}`);
  lines.push(``);
  lines.push(`SCORE: ${leadScore.toFixed(1)} — ${result.verdict}`);
  if (result.intentScore !== undefined) {
    lines.push(`Universal score: ${result.overallScore.toFixed(1)}`);
  }
  lines.push(``);

  if (result.intentAlignment) {
    lines.push(`INTENT ALIGNMENT`);
    lines.push(result.intentAlignment);
    lines.push(``);
  }

  lines.push(`DESIGNER'S READ`);
  lines.push(result.designersRead);
  lines.push(``);
  lines.push(rule);
  lines.push(`${result.deepCritique ? "ELEVEN" : "SIX"} DIMENSIONS`);
  lines.push(``);

  for (const d of result.dimensions) {
    lines.push(`${d.label.toUpperCase()} — ${d.score.toFixed(1)}`);
    lines.push(`Finding: ${d.finding}`);
    if (d.points?.length) {
      lines.push(`Breakdown:`);
      for (const p of d.points) lines.push(`  • ${p}`);
    }
    lines.push(`Suggestion: ${d.suggestion}`);
    lines.push(``);
  }

  lines.push(rule);
  lines.push(`Generated by Candor`);

  return lines.join("\n");
}

function buildPrintHTML(result: AuditResult, fileName: string, imageSrc?: string): string {
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
  const leadScore  = result.intentScore ?? result.overallScore;
  const scoreColor = leadScore >= 7.5 ? "#2D7D62" : leadScore >= 6 ? "#C9893A" : "#C05C35";

  const dimRows = result.dimensions.map((d) => {
    const col = d.score >= 7.5 ? "#2D7D62" : d.score >= 6 ? "#C9893A" : "#C05C35";
    const pts  = d.points?.length
      ? `<ul style="margin:6px 0 0 0;padding-left:16px;color:#6D6861;">
          ${d.points.map((p) => `<li style="margin-bottom:3px;">${p}</li>`).join("")}
        </ul>`
      : "";
    return `
      <div style="margin-bottom:20px;padding:16px;border:1px solid #EAE5DE;border-radius:10px;page-break-inside:avoid;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
          <span style="background:${col}22;color:${col};font-size:12px;font-weight:600;padding:3px 10px;border-radius:5px;">
            ${d.score.toFixed(1)}
          </span>
          <strong style="font-size:14px;color:#1C1917;">${d.label}</strong>
        </div>
        <p style="margin:0 0 4px;font-size:13px;color:#6D6861;line-height:1.55;">${d.finding}</p>
        ${pts}
        <p style="margin:8px 0 0;font-size:13px;color:#1C1917;line-height:1.55;">
          <strong>Suggestion:</strong> ${d.suggestion}
        </p>
      </div>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Candor — ${fileName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #fff; color: #1C1917; padding: 48px; max-width: 760px; margin: 0 auto; }
    @media print {
      body { padding: 24px; }
      @page { margin: 1.2cm; }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:20px;border-bottom:1px solid #D4CEC5;margin-bottom:28px;">
    <span style="font-family:'DM Serif Display',serif;font-size:22px;color:#1C1917;">Candor</span>
    <div style="text-align:right;font-size:12px;color:#4A4845;line-height:1.6;">
      <div>${fileName}</div>
      <div>${date}</div>
    </div>
  </div>

  ${imageSrc ? `
  <!-- Design image -->
  <div style="margin-bottom:28px;border-radius:10px;overflow:hidden;border:1px solid #D4CEC5;background:#F5F1EB;">
    <div style="font-size:10px;font-weight:600;color:#4A4845;text-transform:uppercase;letter-spacing:0.08em;padding:10px 14px 8px;border-bottom:1px solid #D4CEC5;">
      Design reviewed
    </div>
    <img src="${imageSrc}" alt="${fileName}" style="display:block;width:100%;max-height:480px;object-fit:contain;" />
  </div>` : ""}

  <!-- Score -->
  <div style="margin-bottom:24px;">
    <div style="font-family:'DM Serif Display',serif;font-size:72px;color:#1C1917;line-height:1;">${leadScore.toFixed(1)}</div>
    <div style="display:flex;align-items:center;gap:14px;margin-top:10px;">
      <span style="display:inline-block;background:${scoreColor}22;color:${scoreColor};font-size:12px;font-weight:600;padding:4px 12px;border-radius:6px;">
        ${result.verdict}
      </span>
      ${result.intentScore !== undefined
        ? `<span style="font-size:13px;color:#4A4845;">Universal score: ${result.overallScore.toFixed(1)}</span>`
        : ""}
    </div>
  </div>

  ${result.primaryIntent ? `
  <div style="margin-bottom:20px;padding:14px 16px;background:#F5F1EB;border-radius:8px;border:1px solid #D4CEC5;">
    <div style="font-size:11px;font-weight:600;color:#4A4845;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">Primary Design Intent</div>
    <p style="font-size:14px;color:#1C1917;margin-bottom:${result.intentAlignment ? "6px" : "0"};">${result.primaryIntent}</p>
    ${result.intentAlignment ? `<p style="font-size:13px;color:#3A3835;font-style:italic;line-height:1.55;">${result.intentAlignment}</p>` : ""}
  </div>` : ""}

  <!-- Designer's Read -->
  <div style="margin-bottom:28px;padding-bottom:24px;border-bottom:1px solid #D4CEC5;">
    <div style="font-size:11px;font-weight:600;color:#4A4845;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;">Designer's Read</div>
    <p style="font-size:17px;font-weight:500;color:#1C1917;line-height:1.55;">${result.designersRead}</p>
  </div>

  <!-- Dimensions -->
  <div style="font-size:11px;font-weight:600;color:#4A4845;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:16px;">${result.deepCritique ? "Eleven" : "Six"} Dimensions</div>
  ${dimRows}

  <!-- Footer -->
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #D4CEC5;font-size:11px;color:#4A4845;text-align:center;">
    Generated by Candor
  </div>
</body>
</html>`;
}

function triggerDownload(content: string, fileName: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Export menu ──────────────────────────────────────────────────
function ExportMenu({ result, fileName, imageSrc }: { result: AuditResult; fileName: string; imageSrc?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const slug = fileName.replace(/\.[^.]+$/, "").replace(/\s+/g, "-").toLowerCase();

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  const exportMd = () => {
    triggerDownload(buildMarkdown(result, fileName, imageSrc), `candor-${slug}.md`, "text/markdown");
    setOpen(false);
  };
  const exportTxt = () => {
    triggerDownload(buildPlainText(result, fileName), `candor-${slug}.txt`, "text/plain");
    setOpen(false);
  };
  const exportPdf = () => {
    const html   = buildPrintHTML(result, fileName, imageSrc);
    const blob   = new Blob([html], { type: "text/html" });
    const url    = URL.createObjectURL(blob);
    const win    = window.open(url, "_blank");
    // Auto-trigger print dialog once loaded
    if (win) win.onload = () => { win.print(); URL.revokeObjectURL(url); };
    setOpen(false);
  };

  const options = [
    { label: "Markdown", ext: ".md",  action: exportMd  },
    { label: "Plain text", ext: ".txt", action: exportTxt },
    { label: "PDF",      ext: ".pdf", action: exportPdf },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-sm font-medium text-[#6D6861] bg-white border border-[#D4CEC5] rounded-lg px-3 py-1.5 hover:border-[#A09890] hover:text-[#1C1917] transition-colors flex items-center gap-1.5"
      >
        Export
        <svg
          viewBox="0 0 12 12" width="11" height="11" fill="none"
          className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className="absolute bottom-full mb-2 right-0 w-44 bg-white border border-[#EAE5DE] rounded-xl shadow-lg overflow-hidden z-50">
          {options.map(({ label, ext, action }) => (
            <button
              key={ext}
              onClick={action}
              className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-[#1C1917] hover:bg-[#F5F1EB] transition-colors"
            >
              <span>{label}</span>
              <span className="text-xs text-[#A09890] font-mono">{ext}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Share + Export bar ───────────────────────────────────────────
function ShareBar({
  score,
  verdict,
  result,
  fileName,
  imageSrc,
}: {
  score: number;
  verdict: string;
  result: AuditResult;
  fileName: string;
  imageSrc?: string;
}) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex items-center justify-between py-6 border-t border-[#EAE5DE] mt-4">
      <p className="text-sm text-[#6D6861]">
        Overall <span className="font-semibold text-[#1C1917]">{score.toFixed(1)}</span>
        {" · "}
        <span style={{ color: scoreTextColor(score) }}>{verdict}</span>
      </p>
      <div className="flex items-center gap-2">
        <ExportMenu result={result} fileName={fileName} imageSrc={imageSrc} />
        <button
          onClick={copy}
          className="text-sm font-medium text-[#1D5A46] bg-[#E5F3EE] border border-[#2D7D62] rounded-lg px-3 py-1.5 hover:bg-[#D0EDDF] transition-colors"
        >
          {copied ? "Link copied ✓" : "Share"}
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────
export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult]         = useState<AuditResult | null>(null);
  const [imageSrc, setImageSrc]     = useState<string>("");
  const [fileName, setFileName]     = useState<string>("your design");
  const [ready, setReady]           = useState(false);
  const [activeDim, setActiveDim]   = useState<DimensionScore | null>(null);

  useEffect(() => {
    const raw      = sessionStorage.getItem("candor_result");
    const img      = sessionStorage.getItem("candor_image");
    const name     = sessionStorage.getItem("candor_filename");

    if (!raw) {
      // Nothing in session — send back to landing
      router.replace("/");
      return;
    }

    try {
      setResult(JSON.parse(raw));
      if (img)  setImageSrc(img);
      if (name) setFileName(name);
      setReady(true);
    } catch {
      router.replace("/");
    }
  }, [router]);

  const handleNewAudit = () => {
    sessionStorage.removeItem("candor_result");
    sessionStorage.removeItem("candor_image");
    sessionStorage.removeItem("candor_filename");
    router.push("/");
  };

  if (!ready || !result) return <LoadingSkeleton />;

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Nav fileName={fileName} onNewAudit={handleNewAudit} />

      {/* Detail panel — renders over everything */}
      <DetailPanel dim={activeDim} onClose={() => setActiveDim(null)} />

      <main className="max-w-4xl mx-auto px-6 md:px-8 pb-24">

        {/* Score hero + bars */}
        <ScoreHero
          score={result.overallScore}
          verdict={result.verdict}
          intentScore={result.intentScore}
          primaryIntent={result.primaryIntent}
          dimensions={result.dimensions}
        />

        {/* Designer's Read */}
        <DesignersRead text={result.designersRead} />

        {result.deepCritique ? (
          /* ── Deep mode: thumbnail at top + 2-col card grid ── */
          <div className="pt-8">
            {/* Section header + thumbnail */}
            <div className="flex items-start justify-between gap-6 mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-[15px] font-semibold text-[#1C1917]">Eleven dimensions</p>
                  <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-md bg-[#E5F3EE] text-[#1D5A46]">
                    Deep
                  </span>
                </div>
                <p className="text-xs text-[#A09890]">Tap any card to expand · Deep dive for full detail</p>
                {result.aiSurface && (
                  <p className="text-xs text-[#4A4845] mt-1.5">{aiSurfaceLabel(result.aiSurface)}</p>
                )}
              </div>
              {imageSrc && (
                <div className="flex-shrink-0 hidden md:block">
                  <p className="text-[10px] font-medium tracking-widest uppercase text-[#A09890] mb-1.5">
                    Design reviewed
                  </p>
                  <div
                    className="rounded-xl overflow-hidden border border-[#D4CEC5] bg-[#F5F1EB] cursor-pointer"
                    style={{ width: 200 }}
                    onClick={() => {
                      const w = window.open("", "_blank");
                      if (w) { w.document.write(`<img src="${imageSrc}" style="max-width:100%">`); }
                    }}
                  >
                    <img
                      src={imageSrc}
                      alt="Reviewed design"
                      className="w-full object-contain"
                      style={{ maxHeight: 130 }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 2-column card grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {result.dimensions.map((d, i) => (
                <DimCard
                  key={d.label}
                  dim={d}
                  index={i}
                  onDeepDive={setActiveDim}
                />
              ))}
            </div>

            {/* Mobile image panel */}
            {imageSrc && (
              <div className="md:hidden mt-8">
                <ImagePanel src={imageSrc} />
              </div>
            )}
          </div>
        ) : (
          /* ── Standard mode: cards left, image right ── */
          <>
            <div className="pt-8 grid grid-cols-1 md:grid-cols-[1fr_320px] gap-8 items-start">
              <div>
                <div className="flex items-baseline justify-between mb-4">
                  <p className="text-[15px] font-semibold text-[#1C1917]">Six dimensions</p>
                  <p className="text-xs text-[#A09890]">Tap any card to expand</p>
                </div>
                <div className="flex flex-col gap-3">
                  {result.dimensions.map((d, i) => (
                    <DimCard
                      key={d.label}
                      dim={d}
                      index={i}
                      onDeepDive={setActiveDim}
                    />
                  ))}
                </div>
              </div>

              {imageSrc && (
                <div className="hidden md:block sticky top-24">
                  <ImagePanel src={imageSrc} />
                </div>
              )}
            </div>

            {imageSrc && (
              <div className="md:hidden mt-8">
                <ImagePanel src={imageSrc} />
              </div>
            )}
          </>
        )}

        {/* Share + Export bar */}
        <ShareBar
          score={result.overallScore}
          verdict={result.verdict}
          result={result}
          fileName={fileName}
          imageSrc={imageSrc || undefined}
        />

      </main>
    </div>
  );
}
