"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Cat } from "@/generated/prisma/browser";

export function CatManager({ cats }: { cats: Cat[] }) {
  const router = useRouter();
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newName.trim()) return;

    await fetch("/api/cats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    setNewName("");
    router.refresh();
  }

  async function handleRename(catId: string) {
    if (!editName.trim()) return;
    await fetch(`/api/cats/${catId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName.trim() }),
    });
    setEditingId(null);
    router.refresh();
  }

  async function handleDelete(cat: Cat) {
    const confirmed = confirm(
      `Delete ${cat.name} and all of their feeding history? This cannot be undone.`,
    );
    if (!confirmed) return;
    await fetch(`/api/cats/${cat.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {cats.map((cat) => (
          <li
            key={cat.id}
            className="flex items-center justify-between gap-3 rounded-md border border-black/[.08] px-4 py-2 text-sm dark:border-white/[.145]"
          >
            {editingId === cat.id ? (
              <div className="flex flex-1 gap-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  className="flex-1 rounded-md border border-black/[.08] bg-transparent px-2 py-1 dark:border-white/[.145]"
                />
                <button
                  type="button"
                  onClick={() => handleRename(cat.id)}
                  className="rounded-md bg-foreground px-3 py-1 text-background"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="rounded-md border border-black/[.08] px-3 py-1 dark:border-white/[.145]"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <span className="font-medium text-black dark:text-zinc-50">
                  {cat.name}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(cat.id);
                      setEditName(cat.name);
                    }}
                    className="rounded-md border border-black/[.08] px-3 py-1 text-xs dark:border-white/[.145]"
                  >
                    Rename
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(cat)}
                    className="rounded-md border border-red-600/30 px-3 py-1 text-xs text-red-600 dark:text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
        {cats.length === 0 && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No cats yet.</p>
        )}
      </ul>

      <form onSubmit={handleCreate} className="flex gap-3">
        <input
          type="text"
          placeholder="New cat's name"
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          className="flex-1 rounded-md border border-black/[.08] bg-transparent px-3 py-2 text-sm dark:border-white/[.145]"
        />
        <button
          type="submit"
          className="rounded-md border border-black/[.08] px-4 py-2 text-sm font-medium transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
        >
          Add cat
        </button>
      </form>
    </div>
  );
}
