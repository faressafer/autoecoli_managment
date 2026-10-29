"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZES = [10, 25, 50];

/**
 * Client-side pagination over an already filtered list.
 * `resetOn` lists the filter values (search text, selected tab…): when one changes, it goes back to page 1.
 */
export function usePagination<T>(items: T[], resetOn: unknown[] = [], initialPageSize = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Reset during render rather than in an effect, so the stale page never paints.
  const key = JSON.stringify([pageSize, ...resetOn]);
  const [lastKey, setLastKey] = useState(key);
  if (key !== lastKey) {
    setLastKey(key);
    setPage(1);
  }

  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  // Clamp: deleting the last row of the last page should not leave an empty page.
  const current = Math.min(page, pageCount);
  const start = (current - 1) * pageSize;

  return {
    page: current,
    setPage,
    pageSize,
    setPageSize,
    pageCount,
    total: items.length,
    start,
    pageItems: items.slice(start, start + pageSize),
  };
}

type PaginationProps = Omit<ReturnType<typeof usePagination>, "pageItems"> & {
  label?: string; // plural noun shown in the counter, e.g. "candidats"
  className?: string;
};

// 1 … 4 5 6 … 12
function pageNumbers(page: number, pageCount: number): (number | "gap")[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const pages = new Set([1, pageCount, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("gap");
    out.push(p);
  });
  return out;
}

export default function Pagination({
  page,
  setPage,
  pageSize,
  setPageSize,
  pageCount,
  total,
  start,
  label = "résultats",
  className = "",
}: PaginationProps) {
  if (total === 0) return null;

  const navButton =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-gray-200 bg-white px-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-40";

  return (
    <div
      className={`flex flex-col gap-3 border-t border-gray-100 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <span>
          <span className="font-semibold text-gray-900">
            {start + 1}–{Math.min(start + pageSize, total)}
          </span>{" "}
          sur <span className="font-semibold text-gray-900">{total}</span> {label}
        </span>
        <label className="hidden items-center gap-2 sm:flex">
          <span className="text-gray-400">·</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="rounded-lg border border-gray-200 bg-white py-1 pl-2 pr-7 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30"
            aria-label="Lignes par page"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
        </label>
      </div>

      {pageCount > 1 && (
        <nav className="flex items-center gap-1" aria-label="Pagination">
          <button type="button" onClick={() => setPage(page - 1)} disabled={page === 1} className={navButton} aria-label="Page précédente">
            <ChevronLeft className="h-4 w-4" />
          </button>
          {pageNumbers(page, pageCount).map((p, i) =>
            p === "gap" ? (
              <span key={`gap-${i}`} className="px-1 text-gray-400">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                aria-current={p === page ? "page" : undefined}
                className={
                  p === page
                    ? "inline-flex h-9 min-w-9 items-center justify-center rounded-lg bg-[#1E3A8A] px-2 text-sm font-semibold text-white"
                    : navButton
                }
              >
                {p}
              </button>
            )
          )}
          <button type="button" onClick={() => setPage(page + 1)} disabled={page === pageCount} className={navButton} aria-label="Page suivante">
            <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      )}
    </div>
  );
}
