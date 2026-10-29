"use client";

import { useMemo, useState } from "react";
import { Search, Phone } from "lucide-react";
import Pagination, { usePagination } from "@/components/ui/Pagination";

type RoleFilter = "all" | "candidat" | "autoecole";

const isSchoolRole = (role?: string) => role === "moniteur" || role === "autoecole" || role === "auto-ecole";

// Firestore Timestamp, Date, ISO string or millis → "06 déc. 2025"
function formatDate(value: any) {
  if (!value) return "—";
  const d = value.toDate?.() ?? new Date(value);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

/** Phone numbers left in the onboarding questionnaire: role tabs, phone search, pagination. */
export default function SurveyContacts({ surveys, loading = false }: { surveys: any[]; loading?: boolean }) {
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [phoneSearch, setPhoneSearch] = useState("");

  const surveyCounts = {
    all: surveys.length,
    candidat: surveys.filter((s) => s.role === "candidat").length,
    autoecole: surveys.filter((s) => isSchoolRole(s.role)).length,
  };

  const filteredSurveys = useMemo(() => {
    const digits = phoneSearch.replace(/\D/g, "");
    return surveys.filter((s) => {
      if (roleFilter === "candidat" && s.role !== "candidat") return false;
      if (roleFilter === "autoecole" && !isSchoolRole(s.role)) return false;
      if (!digits) return true;
      return String(s.phone || s.telephone || "").replace(/\D/g, "").includes(digits);
    });
  }, [surveys, roleFilter, phoneSearch]);

  const surveysPage = usePagination(filteredSurveys, [roleFilter, phoneSearch]);

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <header className="border-b border-gray-100 px-5 py-4">
        <h2 className="text-base font-semibold text-gray-900">Contacts des questionnaires</h2>
        <p className="mt-0.5 text-sm text-gray-500">Numéros laissés dans le questionnaire d&apos;onboarding</p>
      </header>
      <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-3 md:flex-row md:items-center md:justify-between">
        <div className="inline-flex rounded-lg bg-gray-100 p-1" role="tablist">
          {([
            ["all", "Tous"],
            ["candidat", "Candidats"],
            ["autoecole", "Auto-écoles"],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={roleFilter === value}
              onClick={() => setRoleFilter(value)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                roleFilter === value ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {label} <span className="ml-1 text-xs text-gray-400">{surveyCounts[value]}</span>
            </button>
          ))}
        </div>
        <div className="relative md:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            inputMode="tel"
            value={phoneSearch}
            onChange={(e) => setPhoneSearch(e.target.value)}
            placeholder="Rechercher un numéro…"
            className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-5 py-3">Téléphone</th>
              <th className="px-5 py-3">Profil</th>
              <th className="hidden px-5 py-3 sm:table-cell">Langue</th>
              <th className="hidden px-5 py-3 md:table-cell">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              [0, 1, 2, 3, 4].map((i) => (
                <tr key={i}>
                  <td colSpan={4} className="px-5 py-3">
                    <div className="h-5 animate-pulse rounded bg-gray-100" />
                  </td>
                </tr>
              ))
            ) : surveysPage.pageItems.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center text-gray-500">
                  {phoneSearch ? `Aucun numéro ne correspond à « ${phoneSearch} »` : "Aucun contact pour ce filtre"}
                </td>
              </tr>
            ) : (
              surveysPage.pageItems.map((survey) => {
                const phone = survey.phone || survey.telephone;
                const school = isSchoolRole(survey.role);
                return (
                  <tr key={survey.id} className="transition-colors hover:bg-gray-50">
                    <td className="whitespace-nowrap px-5 py-3">
                      {phone ? (
                        <a href={`tel:${String(phone).replace(/\s+/g, "")}`} className="inline-flex items-center gap-2 font-medium text-gray-900 hover:text-[#1E3A8A]" dir="ltr">
                          <Phone className="h-3.5 w-3.5 text-gray-400" />
                          {phone}
                        </a>
                      ) : (
                        <span className="text-gray-400">Non renseigné</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                          survey.role === "candidat"
                            ? "bg-green-50 text-green-700 ring-green-600/20"
                            : school
                            ? "bg-orange-50 text-orange-700 ring-orange-600/20"
                            : "bg-gray-50 text-gray-600 ring-gray-500/20"
                        }`}
                      >
                        {survey.role === "candidat" ? "Candidat" : school ? "Auto-école / Moniteur" : survey.role || "—"}
                      </span>
                    </td>
                    <td className="hidden whitespace-nowrap px-5 py-3 uppercase text-gray-500 sm:table-cell">{survey.language || "—"}</td>
                    <td className="hidden whitespace-nowrap px-5 py-3 text-gray-500 md:table-cell">{formatDate(survey.createdAt ?? survey.submittedAt)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <Pagination {...surveysPage} label="contacts" />
    </section>
  );
}
