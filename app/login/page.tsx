"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!password) return;
    setLoading(true);
    setError(false);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        const from = params.get("from") || "/";
        router.push(from);
      } else {
        setError(true);
        setLoading(false);
      }
    } catch {
      setError(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Wordmark */}
        <h1
          className="text-[#1C1917] mb-1"
          style={{ fontFamily: "var(--font-dm-serif), Georgia, serif", fontSize: 28, fontWeight: 400 }}
        >
          Candor
        </h1>

        <p className="text-[14px] text-[#A09890] mb-10 leading-relaxed">
          This instance is private.<br />
          Enter the password to continue.
        </p>

        {/* Password input */}
        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (error) setError(false);
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Password"
          autoFocus
          autoComplete="current-password"
          className="
            w-full h-[48px] px-4 mb-3
            bg-white border border-[#D4CEC5] rounded-xl
            text-[15px] text-[#1C1917] placeholder-[#A09890]
            focus:outline-none focus:border-[#2D7D62] focus:ring-1 focus:ring-[#2D7D62]
            transition-colors
          "
        />

        {/* Error message */}
        {error && (
          <p className="text-[13px] text-[#C05C35] mb-3">
            Incorrect password. Try again.
          </p>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={!password || loading}
          className="
            w-full h-[48px] rounded-xl
            text-[15px] font-semibold
            transition-all duration-200
            disabled:cursor-not-allowed
          "
          style={{
            background: password && !loading ? "#2D7D62" : "#D4CEC5",
            color: password && !loading ? "#FFFFFF" : "#A09890",
          }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Checking…
            </span>
          ) : (
            "Continue"
          )}
        </button>

        {/* Footer */}
        <p className="mt-10 text-[12px] text-[#A09890] text-center">
          Candor — Honest design critique
        </p>
      </div>
    </div>
  );
}

// Wrap in Suspense because useSearchParams requires it in Next.js App Router
export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
