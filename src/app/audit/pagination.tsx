import Link from "next/link";

export function Pagination({
  currentPage,
  pageCount,
}: {
  currentPage: number;
  pageCount: number;
}) {
  if (pageCount <= 1) return null;

  const prevDisabled = currentPage <= 1;
  const nextDisabled = currentPage >= pageCount;

  return (
    <nav className="flex items-center justify-between text-sm">
      {prevDisabled ? (
        <span className="rounded-md border border-black/[.08] px-3 py-1 text-zinc-400 dark:border-white/[.145] dark:text-zinc-600">
          Previous
        </span>
      ) : (
        <Link
          href={`/audit?page=${currentPage - 1}`}
          className="rounded-md border border-black/[.08] px-3 py-1 text-black dark:border-white/[.145] dark:text-zinc-50"
        >
          Previous
        </Link>
      )}
      <span className="text-zinc-500 dark:text-zinc-400">
        Page {currentPage} of {pageCount}
      </span>
      {nextDisabled ? (
        <span className="rounded-md border border-black/[.08] px-3 py-1 text-zinc-400 dark:border-white/[.145] dark:text-zinc-600">
          Next
        </span>
      ) : (
        <Link
          href={`/audit?page=${currentPage + 1}`}
          className="rounded-md border border-black/[.08] px-3 py-1 text-black dark:border-white/[.145] dark:text-zinc-50"
        >
          Next
        </Link>
      )}
    </nav>
  );
}
