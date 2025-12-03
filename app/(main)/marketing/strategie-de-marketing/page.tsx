"use client";

import { useAuth } from "@/contexts/AuthContext";

export default function EntreprisesConventionneesMarketingPage() {
  const { isSuperAdmin, adminProfile, autoEcole } = useAuth();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Strategie de Marketing</h1>
        <p className="text-gray-600 mt-1">
          Gestion de la strategie de marketing
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500">
          Section Strategie de Marketing - Contenu à venir
        </p>
      </div>
    </div>
  );
}
