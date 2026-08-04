import { prisma } from "@/lib/prisma";
import { AuditTable } from "./audit-table";
import { Pagination } from "./pagination";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 15;

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const requestedPage = Number(pageParam);
  const page =
    Number.isFinite(requestedPage) && requestedPage > 0
      ? Math.floor(requestedPage)
      : 1;

  const [totalCount, cats] = await Promise.all([
    prisma.feeding.count(),
    prisma.cat.findMany({ orderBy: { name: "asc" } }),
  ]);

  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);

  const feedings = await prisma.feeding.findMany({
    orderBy: { updatedAt: "desc" },
    include: { cat: true },
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-16">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
          Audit Log
        </h1>
        <AuditTable feedings={feedings} cats={cats} />
        <Pagination currentPage={currentPage} pageCount={pageCount} />
      </main>
    </div>
  );
}
