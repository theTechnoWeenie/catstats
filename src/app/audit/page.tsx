import { prisma } from "@/lib/prisma";
import { AuditTable } from "./audit-table";

export const dynamic = "force-dynamic";

export default async function AuditLogPage() {
  const [feedings, cats] = await Promise.all([
    prisma.feeding.findMany({
      orderBy: { updatedAt: "desc" },
      include: { cat: true },
    }),
    prisma.cat.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-16">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
          Audit Log
        </h1>
        <AuditTable feedings={feedings} cats={cats} />
      </main>
    </div>
  );
}
