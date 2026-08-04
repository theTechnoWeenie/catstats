"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Cat } from "@/generated/prisma/browser";
import { MEAL_SLOT_LABELS, MEAL_SLOTS } from "@/lib/meal-slots";
import { todayString } from "@/lib/day";
import { useToast } from "@/components/toast";

export function ManualMealEntry({ cats }: { cats: Cat[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [catId, setCatId] = useState(cats[0]?.id ?? "");
  const [day, setDay] = useState(todayString());
  const [mealSlot, setMealSlot] = useState(MEAL_SLOTS[0]);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!catId) {
      setError("Add a cat first.");
      return;
    }
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Enter a positive amount.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/feedings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ catId, day, mealSlot, amount: parsedAmount }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const message = body.error ?? "Failed to log feeding.";
        setError(message);
        showToast(message, "error");
        return;
      }
      const catName = cats.find((cat) => cat.id === catId)?.name ?? "cat";
      showToast(`Logged ${parsedAmount} mL for ${catName}.`);
      setAmount("");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  if (cats.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Add a cat above first.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border border-black/[.08] p-4 dark:border-white/[.145]"
    >
      <div className="flex flex-wrap gap-3">
        <select
          value={catId}
          onChange={(event) => setCatId(event.target.value)}
          className="rounded-md border border-black/[.08] bg-transparent px-3 py-2 text-sm dark:border-white/[.145]"
        >
          {cats.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={day}
          onChange={(event) => setDay(event.target.value)}
          className="rounded-md border border-black/[.08] bg-transparent px-3 py-2 text-sm dark:border-white/[.145]"
        />
        <select
          value={mealSlot}
          onChange={(event) => setMealSlot(event.target.value as typeof mealSlot)}
          className="rounded-md border border-black/[.08] bg-transparent px-3 py-2 text-sm dark:border-white/[.145]"
        >
          {MEAL_SLOTS.map((slot) => (
            <option key={slot} value={slot}>
              {MEAL_SLOT_LABELS[slot]}
            </option>
          ))}
        </select>
        <input
          type="number"
          inputMode="decimal"
          placeholder="Amount (mL)"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          className="w-32 rounded-md border border-black/[.08] bg-transparent px-3 py-2 text-sm dark:border-white/[.145]"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
        >
          Add meal
        </button>
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </form>
  );
}
