"use client";

import { useAuth } from "@/contexts/AuthContext";

export default function TotalCoutAPayerPage() {
  const { isSuperAdmin, adminProfile, autoEcole } = useAuth();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Total Cout a payer</h1>
        <p className="text-gray-600 mt-1">
          Vue globale du total des coûts à payer
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500">
          Section Total Cout a payer - Contenu à venir
        </p>
      </div>
    </div>
  );
}
