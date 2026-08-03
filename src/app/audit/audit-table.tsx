"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Cat } from "@/generated/prisma/browser";
import { MEAL_SLOT_LABELS } from "@/lib/meal-slots";

type FeedingRow = {
  id: string;
  catId: string;
  day: string;
  mealSlot: string;
  amount: number;
  updatedAt: Date;
  cat: Cat;
};

export function AuditTable({
  feedings,
  cats,
}: {
  feedings: FeedingRow[];
  cats: Cat[];
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editCatId, setEditCatId] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  function startEdit(row: FeedingRow) {
    setEditingId(row.id);
    setEditAmount(String(row.amount));
    setEditCatId(row.catId);
    setEditError(null);
  }

  async function saveEdit(id: string) {
    setEditError(null);
    const parsedAmount = Number(editAmount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setEditError("Enter a positive amount.");
      return;
    }

    const response = await fetch(`/api/feedings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: parsedAmount, catId: editCatId }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setEditError(body.error ?? "Failed to update.");
      return;
    }

    setEditingId(null);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this feeding record?")) return;
    await fetch(`/api/feedings/${id}`, { method: "DELETE" });
    router.refresh();
  }

  if (feedings.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        No feedings logged yet.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {feedings.map((row) => (
        <li
          key={row.id}
          className="rounded-md border border-black/[.08] px-4 py-3 text-sm dark:border-white/[.145]"
        >
          {editingId === row.id ? (
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-zinc-500 dark:text-zinc-400">
                  {row.day} · {MEAL_SLOT_LABELS[row.mealSlot as keyof typeof MEAL_SLOT_LABELS]}
                </span>
                <select
                  value={editCatId}
                  onChange={(event) => setEditCatId(event.target.value)}
                  className="rounded-md border border-black/[.08] bg-transparent px-2 py-1 dark:border-white/[.145]"
                >
                  {cats.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  inputMode="decimal"
                  value={editAmount}
                  onChange={(event) => setEditAmount(event.target.value)}
                  className="w-24 rounded-md border border-black/[.08] bg-transparent px-2 py-1 dark:border-white/[.145]"
                />
                <span>mL</span>
                <button
                  type="button"
                  onClick={() => saveEdit(row.id)}
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
              {editError && (
                <p className="text-sm text-red-600 dark:text-red-400">{editError}</p>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-medium text-black dark:text-zinc-50">
                  {row.cat.name}
                </span>
                <span className="text-zinc-500 dark:text-zinc-400">
                  {row.day} · {MEAL_SLOT_LABELS[row.mealSlot as keyof typeof MEAL_SLOT_LABELS]}
                </span>
                <span className="text-zinc-600 dark:text-zinc-400">{row.amount} mL</span>
                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                  updated {new Date(row.updatedAt).toLocaleString()}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(row)}
                  className="rounded-md border border-black/[.08] px-3 py-1 text-xs dark:border-white/[.145]"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(row.id)}
                  className="rounded-md border border-red-600/30 px-3 py-1 text-xs text-red-600 dark:text-red-400"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
