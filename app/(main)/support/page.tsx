"use client";

import { useState, useEffect } from "react";
import {
  Headset,
  Filter,
  Mail,
  Clock,
  User,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import {
  getAllSupportRequests,
  updateSupportStatus,
  subscribeToSupportRequests,
  getSupportCountByStatus,
} from "@/lib/firebase/services/support";
import { SupportRequest } from "@/lib/types";

export default function SupportPage() {
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSubject, setFilterSubject] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    resolved: 0,
    total: 0,
  });

  useEffect(() => {
    loadRequests();
    loadStats();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToSupportRequests(
      (updatedRequests) => {
        setRequests(updatedRequests);
        loadStats();
      },
      filterStatus === "all" ? undefined : filterStatus,
      filterSubject === "all" ? undefined : filterSubject
    );

    return () => unsubscribe();
  }, [filterStatus, filterSubject]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await getAllSupportRequests(
        filterStatus === "all" ? undefined : filterStatus,
        filterSubject === "all" ? undefined : filterSubject
      );
      setRequests(data);
    } catch (error) {
      console.error("Error loading support requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    const data = await getSupportCountByStatus();
    setStats(data);
  };

  const handleStatusChange = async (requestId: string, newStatus: 'pending' | 'in-progress' | 'resolved') => {
    try {
      await updateSupportStatus(requestId, newStatus);
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: newStatus } : r))
      );
      loadStats();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "resolved":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "in-progress":
        return <RefreshCw className="w-4 h-4" />;
      case "resolved":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getSubjectLabel = (subject: string) => {
    const labels: Record<string, string> = {
      general: "Question générale",
      technical: "Problème technique",
      partnership: "Partenariat auto-école",
      candidateSupport: "Support candidat",
      other: "Autre",
    };
    return labels[subject] || subject;
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Headset className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Support Client</h1>
            <p className="text-sm text-gray-500">
              Gérer toutes les demandes de contact
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Headset className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-yellow-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600">En attente</p>
              <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">En cours</p>
              <p className="text-2xl font-bold text-blue-700">{stats.inProgress}</p>
            </div>
            <RefreshCw className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-green-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Résolues</p>
              <p className="text-2xl font-bold text-green-700">{stats.resolved}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, email ou message..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="in-progress">En cours</option>
              <option value="resolved">Résolues</option>
            </select>
          </div>

          {/* Subject Filter */}
          <div>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les sujets</option>
              <option value="general">Question générale</option>
              <option value="technical">Problème technique</option>
              <option value="partnership">Partenariat</option>
              <option value="candidateSupport">Support candidat</option>
              <option value="other">Autre</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-500">Chargement des demandes...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <Headset className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Aucune demande de support</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchQuery ? "Aucun résultat pour votre recherche" : "Toutes les demandes sont traitées!"}
            </p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-5 h-5 text-gray-400" />
                    <h3 className="text-base font-semibold text-gray-900">
                      {request.fullName}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        request.status
                      )} flex items-center gap-1`}
                    >
                      {getStatusIcon(request.status)}
                      {request.status === "pending"
                        ? "En attente"
                        : request.status === "in-progress"
                        ? "En cours"
                        : "Résolue"}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      <span>{request.email}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>{getSubjectLabel(request.subject)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(request.createdAt)}</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 line-clamp-2 mb-3">
                    {request.message}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowDetailsModal(true);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Voir détails
                    </button>
                    <span className="text-gray-300">|</span>
                    <a
                      href={`mailto:${request.email}`}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Répondre par email
                    </a>
                  </div>
                </div>

                {/* Status Actions */}
                <div className="flex flex-col gap-2">
                  {request.status !== "pending" && (
                    <button
                      onClick={() => handleStatusChange(request.id, "pending")}
                      className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                    >
                      En attente
                    </button>
                  )}
                  {request.status !== "in-progress" && (
                    <button
                      onClick={() => handleStatusChange(request.id, "in-progress")}
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      En cours
                    </button>
                  )}
                  {request.status !== "resolved" && (
                    <button
                      onClick={() => handleStatusChange(request.id, "resolved")}
                      className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      Résolue
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-linear-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between rounded-t-lg">
              <h3 className="text-xl font-bold">Détails de la demande</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Statut:</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                    selectedRequest.status
                  )} flex items-center gap-1`}
                >
                  {getStatusIcon(selectedRequest.status)}
                  {selectedRequest.status === "pending"
                    ? "En attente"
                    : selectedRequest.status === "in-progress"
                    ? "En cours"
                    : "Résolue"}
                </span>
              </div>

              {/* User Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom complet
                  </label>
                  <p className="text-black">{selectedRequest.fullName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <p className="text-black">{selectedRequest.email}</p>
                </div>
              </div>

              {/* Subject and Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sujet
                  </label>
                  <p className="text-black">{getSubjectLabel(selectedRequest.subject)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de soumission
                  </label>
                  <p className="text-black">{formatDate(selectedRequest.createdAt)}</p>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-black whitespace-pre-wrap">{selectedRequest.message}</p>
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Langue
                </label>
                <p className="text-black">
                  {selectedRequest.language === "fr" ? "Français" : "العربية"}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <a
                  href={`mailto:${selectedRequest.email}`}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Répondre par email
                </a>

                <div className="flex gap-2">
                  {selectedRequest.status !== "resolved" && (
                    <button
                      onClick={() => {
                        handleStatusChange(selectedRequest.id, "resolved");
                        setShowDetailsModal(false);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Marquer comme résolue
                    </button>
                  )}
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
