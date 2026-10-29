"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  Car,
  UserCog,
  Clock,
  CheckCircle2,
  XCircle,
  Power,
  Crown,
  Star,
  Circle,
  RefreshCw,
  ArrowRight,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";
import { db } from "@/lib/firebase/config";
import { collection, getDocs, doc, updateDoc, Timestamp } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import dynamic from "next/dynamic";

// Dynamically import the map component to avoid SSR issues with Leaflet
const TunisiaMap = dynamic(() => import("@/components/TunisiaMap"), {
  ssr: false,
  loading: () => <div className="h-[560px] animate-pulse rounded-2xl border border-gray-200 bg-white" />,
});

const isSchoolRole = (role?: string) => role === "moniteur" || role === "autoecole" || role === "auto-ecole";

// Firestore Timestamp, Date, ISO string or millis → Date (or null)
function toDate(value: any): Date | null {
  if (!value) return null;
  const d = value.toDate?.() ?? new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

const formatDate = (value: any) => toDate(value)?.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) ?? "—";

const STATUS: Record<string, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-green-50 text-green-700 ring-green-600/20" },
  inactive: { label: "Inactive", className: "bg-red-50 text-red-700 ring-red-600/20" },
  pending: { label: "En attente", className: "bg-amber-50 text-amber-700 ring-amber-600/20" },
};

function StatusBadge({ status }: { status?: string }) {
  const s = STATUS[status ?? ""] ?? { label: status || "—", className: "bg-gray-50 text-gray-600 ring-gray-500/20" };
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${s.className}`}>{s.label}</span>;
}

const TONES = {
  blue: "bg-blue-50 text-[#1E3A8A]",
  orange: "bg-orange-50 text-[#F97316]",
  green: "bg-green-50 text-green-600",
  violet: "bg-violet-50 text-violet-600",
};

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  href,
  tone,
  loading,
  highlight,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  hint?: string;
  href?: string;
  tone: keyof typeof TONES;
  loading: boolean;
  highlight?: boolean;
}) {
  const body = (
    <div
      className={`group h-full rounded-2xl border bg-white p-5 transition-all ${
        highlight ? "border-orange-200 ring-1 ring-orange-100" : "border-gray-200"
      } ${href ? "hover:-translate-y-0.5 hover:shadow-md" : ""}`}
    >
      <div className="flex items-start justify-between">
        <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${TONES[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
        {href && <ArrowRight className="h-4 w-4 text-gray-300 transition-colors group-hover:text-gray-500" />}
      </div>
      <p className="mt-4 text-sm font-medium text-gray-500">{label}</p>
      {loading ? (
        <div className="mt-1 h-8 w-16 animate-pulse rounded bg-gray-100" />
      ) : (
        <p className="mt-1 text-3xl font-bold tracking-tight text-gray-900">{value.toLocaleString("fr-FR")}</p>
      )}
      {hint && !loading && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

function Panel({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <header className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

function EmptyRow({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-5 py-10 text-center text-sm text-gray-500">
      <Icon className="h-8 w-8 text-gray-300" />
      {text}
    </div>
  );
}

export default function DashboardPage() {
  const { error: showError, success: showSuccess, ToastContainer } = useToast();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [autoEcoles, setAutoEcoles] = useState<any[]>([]);
  const [onboardingSurveys, setOnboardingSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedAutoEcole, setSelectedAutoEcole] = useState<any | null>(null);
  const [showPackModal, setShowPackModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const { userProfile, isSuperAdmin, adminProfile, autoEcole } = useAuth();

  useEffect(() => {
    loadData();
  }, [userProfile, isSuperAdmin]);

  // Candidates + instructors of one auto-école (its two subcollections, fetched together)
  const loadSchoolPeople = async (autoEcoleId: string, autoEcoleName?: string) => {
    const [candidatesSnapshot, instructorsSnapshot] = await Promise.all([
      getDocs(collection(db!, "autoecoles", autoEcoleId, "candidat")),
      getDocs(collection(db!, "autoecoles", autoEcoleId, "moniteur")),
    ]);
    const tag = (d: any) => ({ id: d.id, autoEcoleId, autoEcoleName, ...d.data() });
    return { candidates: candidatesSnapshot.docs.map(tag), instructors: instructorsSnapshot.docs.map(tag) };
  };

  const loadData = async () => {
    try {
      if (!db) {
        console.error("Firebase Firestore n'est pas initialisé");
        return;
      }
      if (isSuperAdmin) {
        const [autoEcolesSnapshot, surveysSnapshot] = await Promise.all([
          getDocs(collection(db, "autoecoles")),
          getDocs(collection(db, "onboardingSurveys")),
        ]);
        const autoEcolesData = autoEcolesSnapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
        setAutoEcoles(autoEcolesData);
        setOnboardingSurveys(surveysSnapshot.docs.map((d) => ({ id: d.id, ...d.data() })));

        // All schools in parallel instead of one after the other
        const people = await Promise.all(autoEcolesData.map((ae) => loadSchoolPeople(ae.id, ae.name)));
        setCandidates(people.flatMap((p) => p.candidates));
        setInstructors(people.flatMap((p) => p.instructors));
      } else {
        if (!userProfile?.autoEcoleId && !userProfile?.uid) return;
        const people = await loadSchoolPeople(userProfile.autoEcoleId || userProfile.uid);
        setCandidates(people.candidates);
        setInstructors(people.instructors);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      showError("Impossible de charger les données du tableau de bord");
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const recentCandidates = useMemo(
    () =>
      [...candidates]
        .sort((a, b) => (toDate(b.createdAt ?? b.dateInscription)?.getTime() ?? 0) - (toDate(a.createdAt ?? a.dateInscription)?.getTime() ?? 0))
        .slice(0, 5),
    [candidates]
  );

  const pendingAutoEcoles = autoEcoles.filter((ae) => ae.status === "pending");
  const activeAutoEcoles = autoEcoles.filter((ae) => ae.status === "active").length;
  const availableInstructors = instructors.filter((i) => i.status === "Disponible").length;

  const surveyCounts = {
    all: onboardingSurveys.length,
    candidat: onboardingSurveys.filter((s) => s.role === "candidat").length,
    autoecole: onboardingSurveys.filter((s) => isSchoolRole(s.role)).length,
  };

  const openModal = (autoEcole: any, modal: "details" | "status" | "pack") => {
    setSelectedAutoEcole(autoEcole);
    setShowDetailsModal(modal === "details");
    setShowStatusModal(modal === "status");
    setShowPackModal(modal === "pack");
  };

  const closeModals = () => {
    setShowDetailsModal(false);
    setShowStatusModal(false);
    setShowPackModal(false);
    setSelectedAutoEcole(null);
  };

  const updateAutoEcole = async (fields: Record<string, unknown>, successMessage: string, errorMessage: string) => {
    if (!selectedAutoEcole || !isSuperAdmin || !db) return;
    try {
      setActionLoading(selectedAutoEcole.id);
      await updateDoc(doc(db, "autoecoles", selectedAutoEcole.id), { ...fields, updatedAt: Timestamp.now() });
      closeModals();
      showSuccess(successMessage);
      await loadData();
    } catch (err) {
      console.error(errorMessage, err);
      showError(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  const updateStatus = (status: string) =>
    updateAutoEcole({ status }, "Statut mis à jour", "Erreur lors de la mise à jour du statut");

  const updatePack = (pack: string | null) =>
    updateAutoEcole({ pack }, "Pack mis à jour", "Erreur lors de la mise à jour du pack");

  const getPackIcon = (pack?: string) => {
    switch (pack) {
      case "gold": return <Crown className="w-4 h-4 text-yellow-500" />;
      case "silver": return <Star className="w-4 h-4 text-gray-400" />;
      case "bronze": return <Circle className="w-4 h-4 text-orange-600" />;
      default: return <Circle className="w-4 h-4 text-gray-300" />;
    }
  };

  const getPackBadge = (pack?: string) => {
    const badges = {
      gold: "bg-yellow-50 text-yellow-700 border-yellow-200",
      silver: "bg-gray-50 text-gray-700 border-gray-200",
      bronze: "bg-orange-50 text-orange-700 border-orange-200",
      default: "bg-gray-50 text-gray-400 border-gray-200",
    };
    return badges[pack as keyof typeof badges] || badges.default;
  };

  if (!userProfile && !isSuperAdmin) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A8A] mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  const displayName = isSuperAdmin ? adminProfile?.username : autoEcole?.name;
  const lastLogin = isSuperAdmin ? toDate(adminProfile?.lastLogin) : null;
  const today = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Greeting */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium capitalize text-gray-500">{today}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Bonjour{displayName ? `, ${displayName}` : ""}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isSuperAdmin ? "Vue d'ensemble de toute la plateforme AutoEcoli." : "Vue d'ensemble de votre auto-école."}
            {lastLogin && <> · Dernière connexion le {lastLogin.toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}</>}
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={refreshing || loading}
          className="inline-flex items-center gap-2 self-start rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60 sm:self-auto"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Actualiser
        </button>
      </div>

      {/* Key figures */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {isSuperAdmin ? (
          <>
            <StatCard icon={Car} tone="blue" label="Auto-écoles" value={autoEcoles.length} hint={`${activeAutoEcoles} actives`} href="/commercial/auto-ecole" loading={loading} />
            <StatCard
              icon={Clock}
              tone="orange"
              label="En attente d'approbation"
              value={pendingAutoEcoles.length}
              hint={pendingAutoEcoles.length ? "À valider ci-dessous" : "Rien à valider"}
              loading={loading}
              highlight={pendingAutoEcoles.length > 0}
            />
            <StatCard icon={Users} tone="green" label="Candidats" value={candidates.length} hint="Toutes auto-écoles confondues" href="/commercial/candidat" loading={loading} />
            <StatCard icon={ClipboardList} tone="violet" label="Réponses au questionnaire" value={onboardingSurveys.length} hint={`${surveyCounts.candidat} candidats · ${surveyCounts.autoecole} auto-écoles`} href="/questionnaires" loading={loading} />
          </>
        ) : (
          <>
            <StatCard icon={Users} tone="green" label="Candidats" value={candidates.length} loading={loading} />
            <StatCard icon={UserCog} tone="blue" label="Moniteurs" value={instructors.length} loading={loading} />
            <StatCard icon={CheckCircle2} tone="orange" label="Moniteurs disponibles" value={availableInstructors} loading={loading} />
          </>
        )}
      </div>

      {/* To do + latest activity */}
      <div className={`grid gap-6 ${isSuperAdmin ? "xl:grid-cols-2" : ""}`}>
        {isSuperAdmin && (
          <Panel
            title="Auto-écoles à valider"
            subtitle={pendingAutoEcoles.length ? `${pendingAutoEcoles.length} en attente d'approbation` : undefined}
            action={
              <Link href="/commercial/auto-ecole" className="shrink-0 text-sm font-medium text-[#1E3A8A] hover:underline">
                Tout voir
              </Link>
            }
          >
            {loading ? (
              <div className="space-y-3 p-5">{[0, 1, 2].map((i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100" />)}</div>
            ) : pendingAutoEcoles.length === 0 ? (
              <EmptyRow icon={CheckCircle2} text="Aucune auto-école en attente. Tout est à jour." />
            ) : (
              <ul className="divide-y divide-gray-100">
                {pendingAutoEcoles.slice(0, 5).map((ae) => (
                  <li key={ae.id} className="flex items-center gap-3 px-5 py-3">
                    {ae.logo ? (
                      <img src={ae.logo} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                    ) : (
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm font-bold text-gray-500">
                        {(ae.name || "?").charAt(0).toUpperCase()}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">{ae.name || "Sans nom"}</p>
                      <p className="truncate text-xs text-gray-500">
                        {[ae.city, `inscrite le ${formatDate(ae.createdAt)}`].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => openModal(ae, "details")}
                      className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
                    >
                      Détails
                    </button>
                    <button
                      type="button"
                      onClick={() => openModal(ae, "status")}
                      className="rounded-lg bg-[#1E3A8A] px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-[#1E3A8A]/90"
                    >
                      Traiter
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        )}

        <Panel
          title="Derniers candidats inscrits"
          action={
            isSuperAdmin && (
              <Link href="/commercial/candidat" className="shrink-0 text-sm font-medium text-[#1E3A8A] hover:underline">
                Tout voir
              </Link>
            )
          }
        >
          {loading ? (
            <div className="space-y-3 p-5">{[0, 1, 2].map((i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100" />)}</div>
          ) : recentCandidates.length === 0 ? (
            <EmptyRow icon={Users} text="Aucun candidat pour le moment." />
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentCandidates.map((c) => (
                <li key={`${c.autoEcoleId}-${c.id}`} className="flex items-center gap-3 px-5 py-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-50 text-sm font-bold text-green-700">
                    {`${c.firstName?.[0] ?? ""}${c.lastName?.[0] ?? ""}`.toUpperCase() || "?"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {[c.firstName, c.lastName].filter(Boolean).join(" ") || "Candidat"}
                    </p>
                    <p className="truncate text-xs text-gray-500">{c.autoEcoleName || c.email || c.phone || "—"}</p>
                  </div>
                  <span className="shrink-0 text-xs text-gray-400">{formatDate(c.createdAt ?? c.dateInscription)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {/* Map */}
      {isSuperAdmin && !loading && autoEcoles.length > 0 && <TunisiaMap autoEcoles={autoEcoles} />}

      {/* Status Selection Modal */}
      {showStatusModal && selectedAutoEcole && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeModals}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Changer le statut</h3>
            <p className="text-sm text-gray-600 mb-6">
              Auto-école : <span className="font-semibold">{selectedAutoEcole.name}</span>
            </p>

            <div className="space-y-3">
              {([
                ["active", "Activer", "L'auto-école peut utiliser la plateforme", CheckCircle2, "border-green-200 hover:bg-green-50", "text-green-600"],
                ["inactive", "Désactiver", "L'auto-école n'a plus accès à la plateforme", XCircle, "border-red-200 hover:bg-red-50", "text-red-600"],
                ["pending", "Laisser en attente", "En attente d'approbation", Power, "border-amber-200 hover:bg-amber-50", "text-amber-600"],
              ] as const).map(([value, label, description, Icon, buttonClass, iconClass]) => (
                <button
                  key={value}
                  onClick={() => updateStatus(value)}
                  disabled={actionLoading === selectedAutoEcole.id}
                  className={`w-full flex items-center justify-between p-4 border-2 rounded-xl transition-colors disabled:opacity-50 ${buttonClass}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-6 h-6 ${iconClass}`} />
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">{label}</p>
                      <p className="text-xs text-gray-500">{description}</p>
                    </div>
                  </div>
                  {selectedAutoEcole.status === value && <CheckCircle2 className={`w-5 h-5 ${iconClass}`} />}
                </button>
              ))}
            </div>

            <button
              onClick={closeModals}
              className="w-full mt-6 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Pack Selection Modal */}
      {showPackModal && selectedAutoEcole && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeModals}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Sélectionner un pack</h3>
            <p className="text-sm text-gray-600 mb-6">
              Auto-école : <span className="font-semibold">{selectedAutoEcole.name}</span>
            </p>

            <div className="space-y-3">
              {([
                ["gold", "Pack Gold", "Premium - Toutes les fonctionnalités", "border-yellow-200 hover:bg-yellow-50"],
                ["silver", "Pack Silver", "Avancé - Fonctionnalités principales", "border-gray-200 hover:bg-gray-50"],
                ["bronze", "Pack Bronze", "Essentiel - Fonctionnalités de base", "border-orange-200 hover:bg-orange-50"],
              ] as const).map(([value, label, description, buttonClass]) => (
                <button
                  key={value}
                  onClick={() => updatePack(value)}
                  disabled={actionLoading === selectedAutoEcole.id}
                  className={`w-full flex items-center justify-between p-4 border-2 rounded-xl transition-colors disabled:opacity-50 ${buttonClass}`}
                >
                  <div className="flex items-center gap-3">
                    {getPackIcon(value)}
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">{label}</p>
                      <p className="text-xs text-gray-500">{description}</p>
                    </div>
                  </div>
                  {selectedAutoEcole.pack === value && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                </button>
              ))}
            </div>

            <button
              onClick={closeModals}
              className="w-full mt-6 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedAutoEcole && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeModals}>
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Détails de l&apos;auto-école</h3>
              <button onClick={closeModals} className="text-gray-400 hover:text-gray-600" aria-label="Fermer">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {selectedAutoEcole.logo ? (
                  <img src={selectedAutoEcole.logo} alt={selectedAutoEcole.name} className="w-20 h-20 rounded-lg object-cover" />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center">
                    <UserCog className="w-10 h-10 text-gray-400" />
                  </div>
                )}
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{selectedAutoEcole.name}</h4>
                  <p className="text-sm text-gray-500">{selectedAutoEcole.registrationNumber || "N/A"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                {[
                  ["Email", selectedAutoEcole.email],
                  ["Téléphone", selectedAutoEcole.phone],
                  ["Ville", selectedAutoEcole.city],
                  ["Adresse", selectedAutoEcole.address],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="text-sm font-medium text-gray-900 break-words">{value || "N/A"}</p>
                  </div>
                ))}
                <div>
                  <p className="text-xs text-gray-500">Pack</p>
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getPackBadge(selectedAutoEcole.pack)}`}>
                    {getPackIcon(selectedAutoEcole.pack)}
                    {selectedAutoEcole.pack?.toUpperCase() || "AUCUN"}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Statut</p>
                  <StatusBadge status={selectedAutoEcole.status} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Revenu mensuel</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedAutoEcole.monthlyRevenue ? `${selectedAutoEcole.monthlyRevenue.toLocaleString()} TND` : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Candidats</p>
                  <p className="text-sm font-medium text-gray-900">{candidates.filter((c) => c.autoEcoleId === selectedAutoEcole.id).length}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Moniteurs</p>
                  <p className="text-sm font-medium text-gray-900">{instructors.filter((i) => i.autoEcoleId === selectedAutoEcole.id).length}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Date de création</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(selectedAutoEcole.createdAt)}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => openModal(selectedAutoEcole, "status")} className="flex-1 px-4 py-2 bg-[#1E3A8A] text-white rounded-lg hover:bg-[#1E3A8A]/90 transition-colors">
                Changer le statut
              </button>
              <button onClick={() => openModal(selectedAutoEcole, "pack")} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Changer le pack
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}
