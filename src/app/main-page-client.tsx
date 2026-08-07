"use client";

import { useEffect, useMemo, useState } from "react";
import type { Cat } from "@/generated/prisma/browser";
import { calorieRange } from "@/lib/calories";
import { addDays, todayString } from "@/lib/day";
import { buildChartData, FeedingChart } from "./feeding-chart";

type FeedingRow = {
  id: string;
  catId: string;
  day: string;
  mealSlot: string;
  amount: number;
};

type SlotAverage = { mealSlot: string; average: number };

function toAmountMap(rows: FeedingRow[]): Map<string, number> {
  return new Map(rows.map((row) => [row.mealSlot, row.amount]));
}

async function fetchFeedings(catId: string, day: string): Promise<FeedingRow[]> {
  const response = await fetch(`/api/feedings?catId=${catId}&day=${day}`);
  return response.ok ? response.json() : [];
}

async function fetchNotes(catId: string, day: string): Promise<string> {
  const response = await fetch(`/api/day-notes?catId=${catId}&day=${day}`);
  const body = response.ok ? await response.json() : { notes: "" };
  return body.notes ?? "";
}

async function fetchAverages(catId: string): Promise<SlotAverage[]> {
  const response = await fetch(`/api/feedings/average?catId=${catId}`);
  return response.ok ? response.json() : [];
}

export function MainPageClient({ cats }: { cats: Cat[] }) {
  const [catId, setCatId] = useState(cats[0].id);
  const [selectedDay, setSelectedDay] = useState(todayString());
  const [showPrevDay, setShowPrevDay] = useState(false);
  const [showTrend, setShowTrend] = useState(false);

  const [selectedDayFeedings, setSelectedDayFeedings] = useState<FeedingRow[]>([]);
  const [prevDayFeedings, setPrevDayFeedings] = useState<FeedingRow[]>([]);
  const [trendAverages, setTrendAverages] = useState<SlotAverage[]>([]);
  const [notes, setNotes] = useState("");
  const [notesSaving, setNotesSaving] = useState(false);

  const [amount, setAmount] = useState("");
  const [logError, setLogError] = useState<string | null>(null);
  const [logging, setLogging] = useState(false);

  const prevDay = useMemo(() => addDays(selectedDay, -1), [selectedDay]);

  useEffect(() => {
    let cancelled = false;
    fetchFeedings(catId, selectedDay).then((rows) => {
      if (!cancelled) setSelectedDayFeedings(rows);
    });
    fetchNotes(catId, selectedDay).then((value) => {
      if (!cancelled) setNotes(value);
    });
    return () => {
      cancelled = true;
    };
  }, [catId, selectedDay]);

  useEffect(() => {
    let cancelled = false;
    fetchFeedings(catId, prevDay).then((rows) => {
      if (!cancelled) setPrevDayFeedings(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [catId, prevDay]);

  useEffect(() => {
    if (!showTrend) return;
    let cancelled = false;
    fetchAverages(catId).then((rows) => {
      if (!cancelled) setTrendAverages(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [catId, showTrend]);

  const chartData = useMemo(
    () =>
      buildChartData({
        selectedDayAmounts: toAmountMap(selectedDayFeedings),
        prevDayAmounts: showPrevDay ? toAmountMap(prevDayFeedings) : undefined,
        trendAmounts: showTrend
          ? new Map(trendAverages.map((a) => [a.mealSlot, a.average]))
          : undefined,
      }),
    [selectedDayFeedings, prevDayFeedings, trendAverages, showPrevDay, showTrend],
  );

  const totalMl = selectedDayFeedings.reduce((sum, row) => sum + row.amount, 0);
  const calories = calorieRange(totalMl);

  const prevTotalMl = prevDayFeedings.reduce((sum, row) => sum + row.amount, 0);
  const prevCalories = calorieRange(prevTotalMl);
  const trendVsPrevDay: "up" | "down" | "similar" =
    Math.abs(totalMl - prevTotalMl) <= 5 ? "similar" : totalMl > prevTotalMl ? "up" : "down";

  async function handleSaveNotes() {
    setNotesSaving(true);
    try {
      await fetch("/api/day-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ catId, day: selectedDay, notes }),
      });
    } finally {
      setNotesSaving(false);
    }
  }

  async function handleLogMeal(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLogError(null);

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setLogError("Enter a positive amount.");
      return;
    }

    setLogging(true);
    try {
      const response = await fetch("/api/feedings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ catId, amount: parsedAmount }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setLogError(body.error ?? "Failed to log feeding.");
        return;
      }
      setAmount("");
      if (selectedDay === todayString()) {
        setSelectedDayFeedings(await fetchFeedings(catId, selectedDay));
      }
    } finally {
      setLogging(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
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

        <button
          type="button"
          onClick={() => setSelectedDay((d) => addDays(d, -1))}
          className="rounded-md border border-black/[.08] px-3 py-2 text-sm dark:border-white/[.145]"
        >
          ←
        </button>
        <input
          type="date"
          value={selectedDay}
          onChange={(event) => setSelectedDay(event.target.value)}
          className="rounded-md border border-black/[.08] bg-transparent px-3 py-2 text-sm dark:border-white/[.145]"
        />
        <button
          type="button"
          onClick={() => setSelectedDay((d) => addDays(d, 1))}
          className="rounded-md border border-black/[.08] px-3 py-2 text-sm dark:border-white/[.145]"
        >
          →
        </button>

        <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <input
            type="checkbox"
            checked={showPrevDay}
            onChange={(event) => setShowPrevDay(event.target.checked)}
          />
          Compare to previous day
        </label>
        <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <input
            type="checkbox"
            checked={showTrend}
            onChange={(event) => setShowTrend(event.target.checked)}
          />
          Show historical trend
        </label>
      </div>

      <FeedingChart
        data={chartData}
        showPrevDay={showPrevDay}
        showTrend={showTrend}
        prevDayLabel={prevDay}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-black/[.08] p-4 text-sm dark:border-white/[.145]">
          <div className="flex gap-6">
            <div>
              <p className="text-zinc-500 dark:text-zinc-400">Total consumed</p>
              <p className="flex items-center gap-1.5 text-2xl font-semibold">
                {totalMl.toFixed(0)} mL
                <span
                  title={
                    trendVsPrevDay === "up"
                      ? "Up from previous day"
                      : trendVsPrevDay === "down"
                        ? "Down from previous day"
                        : "Similar to previous day"
                  }
                  className={
                    trendVsPrevDay === "up"
                      ? "text-green-600 dark:text-green-400"
                      : trendVsPrevDay === "down"
                        ? "text-red-600 dark:text-red-400"
                        : "text-zinc-400"
                  }
                >
                  {trendVsPrevDay === "up" ? "↑" : trendVsPrevDay === "down" ? "↓" : "→"}
                </span>
              </p>
              <p className="text-zinc-500 dark:text-zinc-400">
                {calories.min.toFixed(0)}–{calories.max.toFixed(0)} calories
              </p>
            </div>
            {showPrevDay && (
              <div className="border-l border-black/[.08] pl-6 dark:border-white/[.145]">
                <p className="text-zinc-500 dark:text-zinc-400">Previous</p>
                <p className="text-2xl font-semibold">{prevTotalMl.toFixed(0)} mL</p>
                <p className="text-zinc-500 dark:text-zinc-400">
                  {prevCalories.min.toFixed(0)}–{prevCalories.max.toFixed(0)} calories
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="rounded-xl border border-black/[.08] p-4 dark:border-white/[.145]">
          <label className="text-sm text-zinc-500 dark:text-zinc-400" htmlFor="day-notes">
            Notes for {selectedDay}
          </label>
          <textarea
            id="day-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            onBlur={handleSaveNotes}
            rows={3}
            className="mt-2 w-full resize-none rounded-md border border-black/[.08] bg-transparent px-3 py-2 text-sm dark:border-white/[.145]"
          />
          {notesSaving && <p className="mt-1 text-xs text-zinc-400">Saving…</p>}
        </div>
      </div>

      <form
        onSubmit={handleLogMeal}
        className="flex flex-col gap-3 rounded-xl border border-black/[.08] p-4 dark:border-white/[.145]"
      >
        <div className="flex gap-3">
          <input
            type="number"
            inputMode="decimal"
            placeholder="Amount just fed (mL)"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="flex-1 rounded-md border border-black/[.08] bg-transparent px-3 py-2 text-sm dark:border-white/[.145]"
          />
          <button
            type="submit"
            disabled={logging}
            className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
          >
            Log feeding
          </button>
        </div>
        {logError && <p className="text-sm text-red-600 dark:text-red-400">{logError}</p>}
      </form>
    </div>
  );
}
