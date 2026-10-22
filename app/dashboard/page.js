
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const STATUSES = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [user, setUser] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [tasks, setTasks] = useState([]);

  const [workspaceName, setWorkspaceName] = useState("");
  const [workspacePassword, setWorkspacePassword] = useState("");
  const [joinId, setJoinId] = useState("");
  const [joinPassword, setJoinPassword] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [deadline, setDeadline] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const selectedWorkspace = workspaces.find(
    (workspace) => workspace.id === selectedId
  );

  const loadWorkspaces = useCallback(async (preferredId = "") => {
    const { data, error } = await supabase
      .from("workspaces")
      .select("id, name, owner_id, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const list = data || [];
    setWorkspaces(list);

    const nextId =
      list.find((workspace) => workspace.id === preferredId)?.id ||
      list.find((workspace) => workspace.id === selectedId)?.id ||
      list[0]?.id ||
      "";

    setSelectedId(nextId);
    return nextId;
  }, [selectedId]);

  const loadTasks = useCallback(async (workspaceId) => {
    if (!workspaceId) {
      setTasks([]);
      return;
    }

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    setTasks(data || []);
  }, []);

  const refresh = useCallback(async (preferredId = "") => {
    setError("");

    try {
      const id = await loadWorkspaces(preferredId);
      await loadTasks(id);
    } catch (err) {
      setError(err.message || "Gagal memuat data.");
    }
  }, [loadWorkspaces, loadTasks]);

  useEffect(() => {
    let active = true;

    async function init() {
      const { data, error } = await supabase.auth.getUser();

      if (!active) return;

      if (error || !data.user) {
        router.replace("/login");
        return;
      }

      setUser(data.user);

      try {
        await refresh();
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    init();

    return () => {
      active = false;
    };
  }, [router, refresh]);

  useEffect(() => {
    if (!loading) {
      loadTasks(selectedId).catch((err) => setError(err.message));
    }
  }, [selectedId, loading, loadTasks]);

  async function handleCreateWorkspace(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      const { data, error } = await supabase.rpc(
        "create_workspace_with_password",
        {
          _name: workspaceName,
          _password: workspacePassword,
        }
      );

      if (error) throw error;

      setWorkspaceName("");
      setWorkspacePassword("");
      await refresh(data);
      setMessage("Workspace berhasil dibuat.");
    } catch (err) {
      setError(err.message || "Gagal membuat workspace.");
    } finally {
      setSaving(false);
    }
  }

  async function handleJoinWorkspace(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      const { error } = await supabase.rpc("join_workspace", {
        _workspace_id: joinId.trim(),
        _password: joinPassword,
      });

      if (error) throw error;

      setJoinId("");
      setJoinPassword("");
      await refresh(joinId.trim());
      setMessage("Berhasil bergabung dengan workspace.");
    } catch (err) {
      setError(err.message || "Gagal bergabung dengan workspace.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateTask(event) {
    event.preventDefault();
    if (!selectedId || !user) return;

    setError("");
    setMessage("");
    setSaving(true);

    try {
      const { error } = await supabase.from("tasks").insert({
        user_id: user.id,
        workspace_id: selectedId,
        title: title.trim(),
        description: description.trim() || null,
        priority,
        deadline: deadline
          ? new Date(`${deadline}T00:00:00`).toISOString()
          : null,
      });

      if (error) throw error;

      setTitle("");
      setDescription("");
      setPriority("medium");
      setDeadline("");
      await loadTasks(selectedId);
      setMessage("Task berhasil dibuat.");
    } catch (err) {
      setError(err.message || "Gagal membuat task.");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(taskId, status) {
    setError("");

    const { error } = await supabase
      .from("tasks")
      .update({ status })
      .eq("id", taskId)
      .eq("workspace_id", selectedId);

    if (error) {
      setError(error.message);
      return;
    }

    await loadTasks(selectedId);
  }

  async function handleDeleteTask(taskId) {
    if (!window.confirm("Hapus task ini?")) return;

    setError("");

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId)
      .eq("workspace_id", selectedId);

    if (error) {
      setError(error.message);
      return;
    }

    await loadTasks(selectedId);
    setMessage("Task berhasil dihapus.");
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      setError(error.message);
      return;
    }

    router.replace("/login");
  }

  if (loading) return <main className="p-8">Memuat TaskMan...</main>;

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">TaskMan</h1>
          <p className="text-sm text-gray-500">
            Login sebagai {user?.email}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="rounded border px-4 py-2"
        >
          Logout
        </button>
      </header>

      {error && (
        <p role="alert" className="rounded border border-red-300 p-3 text-red-700">
          {error}
        </p>
      )}

      {message && (
        <p className="rounded border p-3">{message}</p>
      )}

      <section className="grid gap-6 md:grid-cols-2">
        <form onSubmit={handleCreateWorkspace} className="space-y-3 rounded border p-5">
          <h2 className="text-xl font-semibold">Buat Workspace</h2>

          <input
            className="w-full rounded border p-2"
            placeholder="Nama workspace"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            required
          />

          <input
            className="w-full rounded border p-2"
            type="password"
            placeholder="Password minimal 8 karakter"
            value={workspacePassword}
            onChange={(e) => setWorkspacePassword(e.target.value)}
            minLength={8}
            required
          />

          <button disabled={saving} className="rounded bg-black px-4 py-2 text-white disabled:opacity-50">
            Buat Workspace
          </button>
        </form>

        <form onSubmit={handleJoinWorkspace} className="space-y-3 rounded border p-5">
          <h2 className="text-xl font-semibold">Gabung Workspace</h2>

          <input
            className="w-full rounded border p-2"
            placeholder="Workspace ID"
            value={joinId}
            onChange={(e) => setJoinId(e.target.value)}
            required
          />

          <input
            className="w-full rounded border p-2"
            type="password"
            placeholder="Password workspace"
            value={joinPassword}
            onChange={(e) => setJoinPassword(e.target.value)}
            required
          />

          <button disabled={saving} className="rounded bg-black px-4 py-2 text-white disabled:opacity-50">
            Gabung
          </button>
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Workspace Saya</h2>

        {workspaces.length === 0 ? (
          <p>Belum ada workspace. Buat workspace atau gabung menggunakan ID.</p>
        ) : (
          <div className="space-y-3">
            <select
              className="w-full rounded border p-2"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              {workspaces.map((workspace) => (
                <option key={workspace.id} value={workspace.id}>
                  {workspace.name}
                </option>
              ))}
            </select>

            {selectedWorkspace && (
              <div className="rounded border p-3">
                <p className="font-medium">{selectedWorkspace.name}</p>
                <p className="break-all text-sm text-gray-500">
                  Workspace ID: {selectedWorkspace.id}
                </p>
                <button
                  type="button"
                  className="mt-2 rounded border px-3 py-1 text-sm"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedWorkspace.id);
                    setMessage("Workspace ID disalin.");
                  }}
                >
                  Salin Workspace ID
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {selectedId && (
        <>
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Tambah Task</h2>

            <form onSubmit={handleCreateTask} className="grid gap-3 rounded border p-5 md:grid-cols-2">
              <input
                className="rounded border p-2"
                placeholder="Judul task"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <select
                className="rounded border p-2"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">Prioritas rendah</option>
                <option value="medium">Prioritas sedang</option>
                <option value="high">Prioritas tinggi</option>
              </select>

              <textarea
                className="rounded border p-2 md:col-span-2"
                placeholder="Deskripsi (opsional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <label className="space-y-1">
                <span className="block text-sm">Deadline (opsional)</span>
                <input
                  type="date"
                  className="w-full rounded border p-2"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </label>

              <div className="flex items-end">
                <button
                  disabled={saving}
                  className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
                >
                  Tambah Task
                </button>
              </div>
            </form>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Daftar Task</h2>

            {tasks.length === 0 ? (
              <p>Belum ada task di workspace ini.</p>
            ) : (
              <div className="overflow-x-auto rounded border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-100 text-gray-900">
                    <tr>
                      <th className="p-3">Task</th>
                      <th className="p-3">Prioritas</th>
                      <th className="p-3">Deadline</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task) => (
                      <tr key={task.id} className="border-t">
                        <td className="p-3">
                          <p className="font-medium">{task.title}</p>
                          {task.description && (
                            <p className="mt-1 text-gray-500">{task.description}</p>
                          )}
                        </td>
                        <td className="p-3">{task.priority}</td>
                        <td className="p-3">
                          {task.deadline
                            ? new Date(task.deadline).toLocaleDateString("id-ID")
                            : "-"}
                        </td>
                        <td className="p-3">
                          <select
                            className="rounded border p-2"
                            value={task.status}
                            onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          >
                            {STATUSES.map((status) => (
                              <option key={status.value} value={status.value}>
                                {status.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-red-600 underline"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
