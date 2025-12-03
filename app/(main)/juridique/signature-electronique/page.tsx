"use client";

import { useAuth } from "@/contexts/AuthContext";

export default function SignatureElectroniquePage() {
  const { isSuperAdmin, adminProfile, autoEcole } = useAuth();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Signature Electronique Autoecoli</h1>
        <p className="text-gray-600 mt-1">
          Système de signature électronique
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500">
          Section Signature Electronique - Contenu à venir
        </p>
      </div>
    </div>
  );
}
