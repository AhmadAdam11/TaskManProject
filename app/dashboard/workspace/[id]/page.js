
"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const STATUSES = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

function WorkspaceDetailContent() {
const params = useParams();
  const router = useRouter();
  const workspaceId = params.id;

  const [supabase] = useState(() => createClient());

  const [user, setUser] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [tasks, setTasks] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [deadline, setDeadline] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadTasks = useCallback(async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    setTasks(data || []);
  }, [supabase, workspaceId]);

  const loadWorkspace = useCallback(async () => {
    const { data, error } = await supabase
      .from("workspaces")
      .select("id, name, owner_id, created_at")
      .eq("id", workspaceId)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      throw new Error(
        "Workspace tidak ditemukan atau kamu tidak memiliki akses."
      );
    }

    setWorkspace(data);
  }, [supabase, workspaceId]);

  const refresh = useCallback(async () => {
    await loadWorkspace();
    await loadTasks();
  }, [loadWorkspace, loadTasks]);

  useEffect(() => {
    let active = true;

    async function init() {
      setLoading(true);
      setError("");

      try {
        const { data, error } = await supabase.auth.getUser();

        if (error || !data.user) {
          router.replace("/login");
          return;
        }

        if (!active) return;

        setUser(data.user);
        await refresh();
      } catch (err) {
        if (active) {
          setError(err.message || "Gagal memuat workspace.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    init();

    return () => {
      active = false;
    };
  }, [supabase, router, refresh]);

  async function handleCreateTask(event) {
    event.preventDefault();

    if (!user || !workspaceId) return;

    setError("");
    setMessage("");
    setSaving(true);

    try {
      const { error } = await supabase.from("tasks").insert({
        user_id: user.id,
        workspace_id: workspaceId,
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

      await loadTasks();
      setMessage("Task berhasil dibuat.");
    } catch (err) {
      setError(err.message || "Gagal membuat task.");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(taskId, status) {
    setError("");
    setMessage("");

    const { error } = await supabase
      .from("tasks")
      .update({ status })
      .eq("id", taskId)
      .eq("workspace_id", workspaceId);

    if (error) {
      setError(error.message);
      return;
    }

    try {
      await loadTasks();
      setMessage("Status task berhasil diperbarui.");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteTask(taskId) {
    if (!window.confirm("Hapus task ini?")) return;

    setError("");
    setMessage("");

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId)
      .eq("workspace_id", workspaceId);

    if (error) {
      setError(error.message);
      return;
    }

    try {
      await loadTasks();
      setMessage("Task berhasil dihapus.");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCopyId() {
    try {
      await navigator.clipboard.writeText(workspaceId);
      setMessage("Workspace ID berhasil disalin.");
      setError("");
    } catch {
      setError("Gagal menyalin Workspace ID.");
    }
  }

  if (loading) {
    return <p>Memuat workspace...</p>;
  }

  if (!workspace) {
    return (
      <section className="space-y-4">
        <p role="alert" className="text-red-600">
          {error || "Workspace tidak dapat ditampilkan."}
        </p>

        <button
          onClick={() => router.push("/dashboard/my-workspace")}
          className="rounded border px-4 py-2"
        >
          Kembali ke My Workspace
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <header className="space-y-3">
        <button
          onClick={() => router.push("/dashboard/my-workspace")}
          className="text-sm text-gray-600 hover:underline"
        >
          ← My Workspace
        </button>

        <h2 className="text-2xl font-bold">{workspace.name}</h2>

        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">Workspace ID</p>

          <p className="mt-1 break-all text-sm">{workspace.id}</p>

          <button
            onClick={handleCopyId}
            className="mt-3 rounded border px-3 py-2 text-sm"
          >
            Salin Workspace ID
          </button>
        </div>
      </header>

      {error && (
        <p role="alert" className="rounded border border-red-300 p-3 text-red-700">
          {error}
        </p>
      )}

      {message && (
        <p className="rounded border p-3">{message}</p>
      )}

      <section className="space-y-4">
        <h3 className="text-xl font-semibold">Tambah Task</h3>

        <form
          onSubmit={handleCreateTask}
          className="grid gap-3 rounded-lg border bg-white p-5 md:grid-cols-2"
        >
          <input
            className="rounded border p-2"
            placeholder="Judul task"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />

          <select
            className="rounded border p-2"
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
          >
            <option value="low">Prioritas rendah</option>
            <option value="medium">Prioritas sedang</option>
            <option value="high">Prioritas tinggi</option>
          </select>

          <textarea
            className="rounded border p-2 md:col-span-2"
            placeholder="Deskripsi (opsional)"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />

          <label className="space-y-1">
            <span className="block text-sm">Deadline (opsional)</span>

            <input
              type="date"
              className="w-full rounded border p-2"
              value={deadline}
              onChange={(event) => setDeadline(event.target.value)}
            />
          </label>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Tambah Task"}
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold">Daftar Task</h3>

        {tasks.length === 0 ? (
          <p className="text-gray-600">
            Belum ada task di workspace ini.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100">
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
                        <p className="mt-1 text-gray-500">
                          {task.description}
                        </p>
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
                        onChange={(event) =>
                          handleStatusChange(task.id, event.target.value)
                        }
                      >
                        {STATUSES.map((status) => (
                          <option
                            key={status.value}
                            value={status.value}
                          >
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="p-3">
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-red-600 hover:underline"
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
    </section>
  );
}
export default function WorkspaceDetailPage() {
  return (
    <Suspense fallback={<p>Memuat workspace...</p>}>
      <WorkspaceDetailContent />
    </Suspense>
  );
}
