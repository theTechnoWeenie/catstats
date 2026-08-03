import { prisma } from "@/lib/prisma";
import { CatManager } from "./cat-manager";
import { ManualMealEntry } from "./manual-meal-entry";
import { ResetAllData } from "./reset-all-data";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cats = await prisma.cat.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-6 py-16">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
          Admin
        </h1>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-medium text-black dark:text-zinc-50">Cats</h2>
          <CatManager cats={cats} />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-medium text-black dark:text-zinc-50">
            Manual meal entry
          </h2>
          <ManualMealEntry cats={cats} />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-medium text-red-600 dark:text-red-400">
            Danger zone
          </h2>
          <ResetAllData />
        </section>
      </main>
    </div>
  );
}
