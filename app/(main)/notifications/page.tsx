"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  CheckCheck,
  Filter,
  Trash2,
  Clock,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  CreditCard,
  Package,
  X,
  Send,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getAllNotifications,
  getNotificationsByAutoEcole,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  subscribeToNotifications,
  createNotification,
} from "@/lib/firebase/services/notifications";
import { Notification } from "@/lib/types";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export default function NotificationsPage() {
  const { isSuperAdmin, autoEcole } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Create notification form state
  const [autoEcoles, setAutoEcoles] = useState<any[]>([]);
  const [selectedAutoEcole, setSelectedAutoEcole] = useState<string>("all");
  const [notificationType, setNotificationType] = useState<string>("general");
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");

  useEffect(() => {
    loadNotifications();
    
    // Subscribe to real-time updates
    const unsubscribe = subscribeToNotifications(
      (updatedNotifications) => {
        setNotifications(updatedNotifications);
      },
      isSuperAdmin ? undefined : autoEcole?.id
    );

    return () => unsubscribe();
  }, [isSuperAdmin, autoEcole?.id, filterType]);

  useEffect(() => {
    if (isSuperAdmin) {
      loadAutoEcoles();
    }
  }, [isSuperAdmin]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      let data: Notification[];
      
      if (isSuperAdmin) {
        data = await getAllNotifications(filterType === "all" ? undefined : filterType);
      } else {
        data = await getNotificationsByAutoEcole(
          autoEcole?.id || "",
          filterType === "all" ? undefined : filterType
        );
      }
      
      setNotifications(data);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAutoEcoles = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "autoecoles"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAutoEcoles(data);
    } catch (error) {
      console.error("Error loading auto-écoles:", error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead(isSuperAdmin ? undefined : autoEcole?.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleCreateNotification = async () => {
    if (!notificationTitle || !notificationMessage) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      if (selectedAutoEcole === "all") {
        // Send to all auto-écoles
        const promises = autoEcoles.map((ae) =>
          createNotification(
            ae.id,
            ae.name,
            notificationType as any,
            notificationTitle,
            notificationMessage
          )
        );
        await Promise.all(promises);
      } else {
        // Send to specific auto-école
        const selectedAe = autoEcoles.find((ae) => ae.id === selectedAutoEcole);
        if (selectedAe) {
          await createNotification(
            selectedAe.id,
            selectedAe.name,
            notificationType as any,
            notificationTitle,
            notificationMessage
          );
        }
      }

      // Reset form
      setNotificationTitle("");
      setNotificationMessage("");
      setSelectedAutoEcole("all");
      setNotificationType("general");
      setShowCreateModal(false);
      
      alert("Notification envoyée avec succès!");
    } catch (error) {
      console.error("Error creating notification:", error);
      alert("Erreur lors de l'envoi de la notification");
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "payment":
        return <CreditCard className="w-5 h-5 text-blue-500" />;
      case "pack":
        return <Package className="w-5 h-5 text-purple-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationBorderColor = (type: string) => {
    switch (type) {
      case "success":
        return "border-l-green-500";
      case "warning":
        return "border-l-yellow-500";
      case "error":
        return "border-l-red-500";
      case "payment":
        return "border-l-blue-500";
      case "pack":
        return "border-l-purple-500";
      default:
        return "border-l-gray-500";
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-sm text-gray-500 mt-1">
              {unreadCount > 0 ? `${unreadCount} notification(s) non lue(s)` : "Toutes les notifications sont lues"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isSuperAdmin && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Send className="w-4 h-4" />
                Nouvelle notification
              </button>
            )}
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                Tout marquer comme lu
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Filtrer par type:</span>
        <div className="flex gap-2">
          {["all", "info", "success", "warning", "error", "payment", "pack", "general"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filterType === type
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {type === "all" ? "Tous" : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-500">Chargement des notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Aucune notification</p>
            <p className="text-sm text-gray-400 mt-1">Vous êtes à jour!</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg border-l-4 shadow-sm p-4 transition-all ${
                getNotificationBorderColor(notification.type)
              } ${notification.read ? "opacity-60" : "opacity-100"}`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900 mb-1">
                        {notification.title}
                      </h3>
                      {isSuperAdmin && (
                        <p className="text-sm text-blue-600 font-medium mb-2">
                          {notification.autoEcoleName}
                        </p>
                      )}
                      <p className="text-sm text-gray-700 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(notification.createdAt)}</span>
                        <span className={`px-2 py-0.5 rounded-full ${
                          notification.read
                            ? "bg-gray-100 text-gray-600"
                            : "bg-blue-100 text-blue-700 font-medium"
                        }`}>
                          {notification.read ? "Lu" : "Non lu"}
                        </span>
                      </div>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="flex-shrink-0 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Marquer comme lu"
                      >
                        <CheckCheck className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Notification Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-linear-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between rounded-t-lg">
              <h3 className="text-xl font-bold">Créer une notification</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Auto-école Selection */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Destinataire <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedAutoEcole}
                  onChange={(e) => setSelectedAutoEcole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                >
                  <option value="all">Toutes les auto-écoles</option>
                  {autoEcoles.map((ae) => (
                    <option key={ae.id} value={ae.id}>
                      {ae.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notification Type */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Type de notification <span className="text-red-500">*</span>
                </label>
                <select
                  value={notificationType}
                  onChange={(e) => setNotificationType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                >
                  <option value="general">Général</option>
                  <option value="info">Information</option>
                  <option value="success">Succès</option>
                  <option value="warning">Avertissement</option>
                  <option value="error">Erreur</option>
                  <option value="payment">Paiement</option>
                  <option value="pack">Pack</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Titre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={notificationTitle}
                  onChange={(e) => setNotificationTitle(e.target.value)}
                  placeholder="Titre de la notification"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  placeholder="Contenu du message"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateNotification}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Envoyer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
