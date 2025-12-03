"use client";

import { useAuth } from "@/contexts/AuthContext";

export default function CommercialPage() {
  const { isSuperAdmin, adminProfile, autoEcole } = useAuth();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Commercial</h1>
        <p className="text-gray-600 mt-1">
          Gestion commerciale et relations clients
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500">
          Section Commercial - Contenu à venir
        </p>
      </div>
    </div>
  );
}
