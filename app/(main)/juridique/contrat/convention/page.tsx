"use client";

import { useAuth } from "@/contexts/AuthContext";

export default function ContratConvention() {
  const { isSuperAdmin, adminProfile, autoEcole } = useAuth();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Contrat de Convention</h1>
        <p className="text-gray-600 mt-1">
          Gestion des contrats de convention
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500">
          Section Contrat de Convention - Contenu à venir
        </p>
      </div>
    </div>
  );
}
