"use client";

import { useState } from "react";
import { Settings, Check, X } from "lucide-react";
import { SidebarPermissions } from "@/lib/types";
import { SIDEBAR_MENU_ITEMS, DEFAULT_PERMISSIONS, getAutoEcolePermissions } from "@/lib/utils/permissions";
import { updateAutoEcoleSidebarPermissions } from "@/lib/firebase/services/autoecoles";

interface SidebarPermissionsManagerProps {
  autoEcoleId: string;
  autoEcoleName: string;
  currentPack?: 'bronze' | 'silver' | 'gold' | null;
  currentPermissions?: SidebarPermissions;
  onUpdate: () => void;
  onSuccess?: () => void;
  onError?: () => void;
}

export default function SidebarPermissionsManager({
  autoEcoleId,
  autoEcoleName,
  currentPack,
  currentPermissions,
  onUpdate,
  onSuccess,
  onError,
}: SidebarPermissionsManagerProps) {
  const [permissions, setPermissions] = useState<SidebarPermissions>(
    currentPermissions || getAutoEcolePermissions(currentPack)
  );
  const [loading, setLoading] = useState(false);
  const [showPackDefaults, setShowPackDefaults] = useState(false);

  const handleToggle = (key: keyof SidebarPermissions) => {
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateAutoEcoleSidebarPermissions(autoEcoleId, permissions);
      onUpdate();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error saving permissions:", err);
      if (onError) onError();
    } finally {
      setLoading(false);
    }
  };

  const handleResetToPack = () => {
    if (currentPack) {
      setPermissions(DEFAULT_PERMISSIONS[currentPack]);
    }
  };

  const enabledCount = Object.values(permissions).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            Gestion du Sidebar
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {autoEcoleName} - {enabledCount}/10 fonctionnalités activées
          </p>
        </div>
        
        {currentPack && (
          <button
            onClick={() => setShowPackDefaults(!showPackDefaults)}
            className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {showPackDefaults ? "Masquer" : "Voir"} défauts Pack {currentPack.toUpperCase()}
          </button>
        )}
      </div>

      {/* Pack Defaults Preview */}
      {showPackDefaults && currentPack && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-blue-900">
              Permissions par défaut - Pack {currentPack.toUpperCase()}
            </p>
            <button
              onClick={handleResetToPack}
              className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Restaurer ces valeurs
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {SIDEBAR_MENU_ITEMS.map(item => {
              const isEnabled = DEFAULT_PERMISSIONS[currentPack][item.key];
              return (
                <div
                  key={item.key}
                  className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                    isEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {isEnabled ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  {item.label}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Permissions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SIDEBAR_MENU_ITEMS.map((item) => {
          const isEnabled = permissions[item.key];
          const isEssential = item.key === 'dashboard' || item.key === 'settings';
          
          return (
            <div
              key={item.key}
              className={`border-2 rounded-lg p-4 transition-all ${
                isEnabled
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-gray-50'
              } ${isEssential ? 'opacity-60' : 'cursor-pointer hover:shadow-md'}`}
              onClick={() => !isEssential && handleToggle(item.key)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{item.icon}</span>
                    <h4 className="font-semibold text-gray-900">{item.label}</h4>
                  </div>
                  <p className="text-xs text-gray-600">{item.description}</p>
                  {isEssential && (
                    <p className="text-xs text-blue-600 mt-2 font-medium">
                      ⚠️ Fonctionnalité essentielle (toujours activée)
                    </p>
                  )}
                </div>
                
                <div className="ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isEssential) handleToggle(item.key);
                    }}
                    disabled={isEssential}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      isEnabled ? 'bg-green-500' : 'bg-gray-300'
                    } ${isEssential ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        isEnabled ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          <p className="font-semibold">Résumé des modifications:</p>
          <p className="mt-1">
            {enabledCount} fonctionnalités activées, {10 - enabledCount} désactivées
          </p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? "Enregistrement..." : "💾 Enregistrer les permissions"}
        </button>
      </div>

      {/* Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-xs text-yellow-800">
          <strong>⚠️ Important:</strong> Les modifications prendront effet immédiatement pour cette auto-école. 
          Les utilisateurs devront peut-être recharger leur page pour voir les changements.
        </p>
      </div>
    </div>
  );
}
