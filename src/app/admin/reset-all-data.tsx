"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const CONFIRMATION_PHRASE = "yes delete my data";

export function ResetAllData() {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  async function handleReset() {
    setError(null);
    setResetting(true);
    try {
      const response = await fetch("/api/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: confirmText }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setError(body.error ?? "Failed to reset data.");
        return;
      }
      setConfirmText("");
      router.push("/");
      router.refresh();
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-red-600/30 p-4">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        This permanently deletes every cat, feeding record, and note. This
        operation is not reversible. Type{" "}
        <code className="rounded bg-black/[.06] px-1 dark:bg-white/[.1]">
          {CONFIRMATION_PHRASE}
        </code>{" "}
        below to enable the button.
      </p>
      <input
        type="text"
        value={confirmText}
        onChange={(event) => setConfirmText(event.target.value)}
        placeholder={CONFIRMATION_PHRASE}
        className="rounded-md border border-black/[.08] bg-transparent px-3 py-2 text-sm dark:border-white/[.145]"
      />
      <button
        type="button"
        disabled={confirmText !== CONFIRMATION_PHRASE || resetting}
        onClick={handleReset}
        className="self-start rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
      >
        Reset all data
      </button>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
