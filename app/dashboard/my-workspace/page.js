
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function MyWorkspacePage() {
  const [supabase] = useState(() => createClient());

  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspacePassword, setWorkspacePassword] = useState("");
  const [creating, setCreating] = useState(false);


const loadWorkspaces = useCallback(async () => {
  const { data, error } = await supabase
    .from("workspaces")
    .select("id, name, owner_id, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;

  setWorkspaces(data || []);
}, [supabase]);



useEffect(() => {
  async function init() {
    try {
      await loadWorkspaces();
    } catch (err) {
      setError(err.message || "Gagal memuat workspace.");
    } finally {
      setLoading(false);
    }
  }

  init();
}, [loadWorkspaces]);


  async function handleCreateWorkspace(event) {
    event.preventDefault();
    setError("");
    setCreating(true);

    try {
      const { error } = await supabase.rpc(
        "create_workspace_with_password",
        {
          _name: workspaceName.trim(),
          _password: workspacePassword,
        }
      );

      if (error) throw error;

      await loadWorkspaces();

      setWorkspaceName("");
      setWorkspacePassword("");
      setShowForm(false);
    } catch (err) {
      setError(err.message || "Gagal membuat workspace.");
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
        Memuat workspace...
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            My Workspace
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Kelola workspace milikmu dan workspace yang kamu ikuti.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="rounded-xl bg-[#e4ff7a] px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-[#d9f566]"
        >
          {showForm ? "Batal" : "+ Create Workspace"}
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {showForm && (
        <form
          onSubmit={handleCreateWorkspace}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5"
        >
          <h3 className="font-semibold text-slate-900">
            Buat Workspace Baru
          </h3>

          <div>
            <label
              htmlFor="workspaceName"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Nama Workspace
            </label>
            <input
              id="workspaceName"
              type="text"
              value={workspaceName}
              onChange={(event) => setWorkspaceName(event.target.value)}
              className="w-full rounded-xl border border-slate-300 p-3 text-sm"
              placeholder="Contoh: Kelompok Proyek Web"
              required
            />
          </div>

          <div>
            <label
              htmlFor="workspacePassword"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Password Workspace
            </label>
            <input
              id="workspacePassword"
              type="password"
              value={workspacePassword}
              onChange={(event) =>
                setWorkspacePassword(event.target.value)
              }
              className="w-full rounded-xl border border-slate-300 p-3 text-sm"
              placeholder="Buat password untuk anggota"
              required
            />
          </div>

          <button
            type="submit"
            disabled={creating}
            className="rounded-xl bg-[#121212] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {creating ? "Membuat..." : "Buat Workspace"}
          </button>
        </form>
      )}

      {!error && workspaces.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[#121212] text-[#e4ff7a]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
            </svg>
          </div>

          <h3 className="mt-4 text-base font-semibold text-slate-900">
            Belum ada workspace
          </h3>
          <p className="mt-1.5 text-sm text-slate-500">
            Buat workspace baru atau bergabung dengan workspace yang sudah ada.
          </p>

          <Link
            href="/dashboard/join-workspace"
            className="mt-5 inline-block rounded-xl bg-[#e4ff7a] px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-[#d9f566]"
          >
            Join Workspace
          </Link>
        </div>
      )}

      {workspaces.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((workspace) => (
            <Link
              key={workspace.id}
              href={`/dashboard/workspace/${workspace.id}`}
              className="group rounded-2xl bg-[#121212] p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-[#e4ff7a]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <rect x="2" y="7" width="20" height="14" rx="2" />
                  <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                </svg>
              </div>

              <h3 className="mt-4 text-base font-semibold text-white">
                {workspace.name}
              </h3>

              <p className="mt-1.5 break-all text-xs text-white/40">
                ID: {workspace.id}
              </p>

              <p className="mt-5 text-sm font-medium text-[#e4ff7a]">
                Buka workspace{" "}
                <span className="inline-block transition group-hover:translate-x-1">
                  →
                </span>
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
