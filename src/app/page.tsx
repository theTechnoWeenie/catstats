import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MainPageClient } from "./main-page-client";

export const dynamic = "force-dynamic";

export default async function Home() {
  const cats = await prisma.cat.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-16">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
          Cat Stats
        </h1>

        {cats.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Add a cat to get started —{" "}
            <Link href="/admin" className="underline">
              go to Admin
            </Link>
            .
          </p>
        ) : (
          <MainPageClient cats={cats} />
        )}
      </main>
    </div>
  );
}
