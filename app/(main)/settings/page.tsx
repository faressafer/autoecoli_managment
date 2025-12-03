"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Settings, User, Bell, Lock, Globe, Save } from "lucide-react";

export default function SettingsPage() {
  const { userProfile, isSuperAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "notifications" | "security" | "preferences">("profile");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-7 h-7 text-blue-600" />
            Paramètres
          </h1>
          <p className="text-gray-600 mt-1">
            Gérez vos préférences et paramètres de compte
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
              activeTab === "profile"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <User className="w-5 h-5" />
            Profil
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
              activeTab === "notifications"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Bell className="w-5 h-5" />
            Notifications
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
              activeTab === "security"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Lock className="w-5 h-5" />
            Sécurité
          </button>
          <button
            onClick={() => setActiveTab("preferences")}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
              activeTab === "preferences"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Globe className="w-5 h-5" />
            Préférences
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "profile" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Informations du profil</h3>
              <div className="text-gray-600">
                <p className="mb-4">Gérez vos informations personnelles.</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    Cette fonctionnalité sera bientôt disponible.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Préférences de notification</h3>
              <div className="text-gray-600">
                <p className="mb-4">Configurez vos notifications.</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    Cette fonctionnalité sera bientôt disponible.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Sécurité du compte</h3>
              <div className="text-gray-600">
                <p className="mb-4">Gérez la sécurité de votre compte.</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    Cette fonctionnalité sera bientôt disponible.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Préférences générales</h3>
              <div className="text-gray-600">
                <p className="mb-4">Personnalisez votre expérience.</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    Cette fonctionnalité sera bientôt disponible.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
