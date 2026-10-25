"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";


const tips = [
  "Minta Workspace ID dan password ke pemilik workspace.",
  "ID bisa ditempel langsung lewat tombol Paste.",
  "Setelah bergabung, kamu langsung diarahkan ke workspace.",
];

export default function JoinWorkspacePage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [workspaceId, setWorkspaceId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleJoinWorkspace(event) {
    event.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const normalizedId = workspaceId.trim();

      const { error } = await supabase.rpc("join_workspace", {
        _workspace_id: normalizedId,
        _password: password,
      });

      if (error) throw error;

      setMessage("Berhasil bergabung dengan workspace.");

      router.push(`/dashboard/workspace/${normalizedId}`);
    } catch (err) {
      setError(err.message || "Gagal bergabung dengan workspace.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setWorkspaceId(text.trim());
    } catch {
    }
  }

  const idDone = workspaceId.trim().length > 0;
  const passwordDone = password.length > 0;

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900";

  const stepBadge = (done, number) => (
    <span
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition ${
        done ? "bg-[#e4ff7a] text-slate-900" : "bg-slate-100 text-slate-400"
      }`}
    >
      {done ? (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <path d="M5 12l5 5L20 7" />
        </svg>
      ) : (
        number
      )}
    </span>
  );

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          Join{" "}
          <span className="font-serif font-normal italic">Workspace</span>
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Masukkan ID dan password untuk bergabung dengan workspace.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.25fr_1fr]">
        {/* ===== Form bertahap ===== */}
        <form
          onSubmit={handleJoinWorkspace}
          className="rounded-3xl border border-slate-200 bg-white p-6"
        >
          <div className="relative space-y-6">
            {/* garis penghubung antar langkah */}
            <span
              className="absolute left-3.5 top-8 h-[calc(100%-5.5rem)] w-px bg-slate-200"
              aria-hidden="true"
            />

            <div className="relative flex gap-4">
              {stepBadge(idDone, 1)}
              <div className="flex-1 space-y-1.5">
                <label
                  htmlFor="workspaceId"
                  className="block text-sm font-semibold text-slate-900"
                >
                  Workspace ID
                </label>
                <div className="relative">
                  <input
                    id="workspaceId"
                    type="text"
                    value={workspaceId}
                    onChange={(event) => setWorkspaceId(event.target.value)}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx"
                    spellCheck={false}
                    autoComplete="off"
                    className={`${inputClass} pr-20 font-mono text-[13px]`}
                    required
                  />
                  <button
                    type="button"
                    onClick={handlePaste}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
                  >
                    Paste
                  </button>
                </div>
              </div>
            </div>

            <div className="relative flex gap-4">
              {stepBadge(passwordDone, 2)}
              <div className="flex-1 space-y-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-slate-900"
                >
                  Password Workspace
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Masukkan password workspace"
                    className={`${inputClass} pr-16`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-500 transition hover:text-slate-900"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="ml-11 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            {message && (
              <p
                role="status"
                className="ml-11 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
              >
                {message}
              </p>
            )}

            <div className="ml-11">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#e4ff7a] px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-[#d9f566] disabled:opacity-60"
              >
                {loading ? "Sedang bergabung..." : "Gabung Workspace"}
              </button>
            </div>
          </div>
        </form>

        {/* ===== Panel info gelap ===== */}
        <aside className="relative flex min-h-64 flex-col overflow-hidden rounded-3xl bg-[#121212] p-6">
          <p className="text-xl font-semibold leading-snug tracking-tight text-white">
            Bekerja lebih baik{" "}
            <span className="font-serif font-normal italic text-[#e4ff7a]">
              bersama tim
            </span>
          </p>

          <ul className="relative z-10 mt-5 space-y-3">
            {tips.map((tip) => (
              <li key={tip} className="flex gap-2.5 text-sm text-white/60">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e4ff7a]" />
                {tip}
              </li>
            ))}
            </ul>

            <div className="pointer-events-none absolute -bottom-6 -right-6 h-40 w-40">
            <Image
                src="/accent.png"
                alt=""
                fill
                sizes="160px"
                className="object-contain"
                priority
            />
            </div>
            </aside>
      </div>
    </section>
  );
}