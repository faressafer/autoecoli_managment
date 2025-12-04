"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase/config";
import { collection, getDocs, doc, deleteDoc, addDoc, updateDoc, Timestamp } from "firebase/firestore";
import { useToast } from "@/hooks/useToast";

import {
  Users,
  UserPlus,
  Search,
  Filter,
  RefreshCw,
  Edit2,
  Trash2,
  Eye,
  Phone,
  Mail,
  MapPin,
  Calendar,
  TrendingUp,
  Award,
  Clock,
  X,
  Building2,
  GraduationCap,
  Car,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  dateOfBirth?: string;
  dateInscription?: any;
  status: "Nouveau" | "En cours" | "Examen" | "Réussi" | "Abandonné";
  progress: number;
  theoreticalLessons: number;
  practicalLessons: number;
  autoEcoleId: string;
  autoEcoleName?: string;
  notes?: string;
  createdAt?: any;
  updatedAt?: any;
}

export default function CandidatesManagementPage() {
  const { isSuperAdmin } = useAuth();
  const { success, error: showError, warning, ToastContainer } = useToast();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [autoEcoles, setAutoEcoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterAutoEcole, setFilterAutoEcole] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "date" | "progress">("date");

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    dateOfBirth: "",
    autoEcoleId: "",
    status: "Nouveau" as Candidate["status"],
    progress: 0,
    theoreticalLessons: 0,
    practicalLessons: 0,
    notes: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (!db) {
        console.error("Firebase Firestore n'est pas initialisé");
        return;
      }
      setLoading(true);

      // Load all auto-écoles
      const autoEcolesRef = collection(db, "autoecoles");
      const autoEcolesSnapshot = await getDocs(autoEcolesRef);
      const autoEcolesData = autoEcolesSnapshot.docs.map(doc => ({
        id: doc.id,
        name: "",
        ...doc.data()
      })) as any[];
      setAutoEcoles(autoEcolesData);

      // Load all candidates from all auto-écoles
      let allCandidates: Candidate[] = [];

      for (const autoEcole of autoEcolesData) {
        const candidatsRef = collection(db, "autoecoles", autoEcole.id, "candidat");
        const candidatesSnapshot = await getDocs(candidatsRef);
        candidatesSnapshot.docs.forEach(doc => {
          allCandidates.push({
            id: doc.id,
            autoEcoleId: autoEcole.id,
            autoEcoleName: autoEcole.name,
            ...doc.data()
          } as Candidate);
        });
      }

      setCandidates(allCandidates);
    } catch (err) {
      console.error("Error loading data:", err);
      showError("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.autoEcoleId) {
      showError("Veuillez sélectionner une auto-école");
      return;
    }

    setActionLoading("adding");
    try {
      if (!db) {
        showError("Firebase Firestore n'est pas initialisé");
        return;
      }
      const candidatsRef = collection(db, "autoecoles", formData.autoEcoleId, "candidat");
      await addDoc(candidatsRef, {
        ...formData,
        dateInscription: Timestamp.now(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      success("Candidat ajouté avec succès!");
      setShowAddModal(false);
      resetForm();
      await loadData();
    } catch (err) {
      console.error("Error adding candidate:", err);
      showError("Erreur lors de l'ajout du candidat");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate) return;

    setActionLoading("updating");
    try {
      if (!db) {
        showError("Firebase Firestore n'est pas initialisé");
        return;
      }
      const candidateRef = doc(db, "autoecoles", selectedCandidate.autoEcoleId, "candidat", selectedCandidate.id);
      await updateDoc(candidateRef, {
        ...formData,
        updatedAt: Timestamp.now()
      });

      success("Candidat mis à jour avec succès!");
      setShowEditModal(false);
      setSelectedCandidate(null);
      resetForm();
      await loadData();
    } catch (err) {
      console.error("Error updating candidate:", err);
      showError("Erreur lors de la mise à jour du candidat");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteCandidate = async (candidate: Candidate) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${candidate.firstName} ${candidate.lastName} ?`)) {
      return;
    }

    setActionLoading(candidate.id);
    try {
      if (!db) {
        showError("Firebase Firestore n'est pas initialisé");
        return;
      }
      await deleteDoc(doc(db, "autoecoles", candidate.autoEcoleId, "candidat", candidate.id));
      success("Candidat supprimé avec succès!");
      await loadData();
    } catch (err) {
      console.error("Error deleting candidate:", err);
      showError("Erreur lors de la suppression");
    } finally {
      setActionLoading(null);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      dateOfBirth: "",
      autoEcoleId: "",
      status: "Nouveau",
      progress: 0,
      theoreticalLessons: 0,
      practicalLessons: 0,
      notes: ""
    });
  };

  const openEditModal = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setFormData({
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      email: candidate.email,
      phone: candidate.phone,
      address: candidate.address || "",
      city: candidate.city || "",
      dateOfBirth: candidate.dateOfBirth || "",
      autoEcoleId: candidate.autoEcoleId,
      status: candidate.status,
      progress: candidate.progress,
      theoreticalLessons: candidate.theoreticalLessons,
      practicalLessons: candidate.practicalLessons,
      notes: candidate.notes || ""
    });
    setShowEditModal(true);
  };

  const filteredCandidates = candidates
    .filter(candidate => {
      const matchesSearch = 
        candidate.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.phone?.includes(searchTerm) ||
        candidate.autoEcoleName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === "all" || candidate.status === filterStatus;
      const matchesAutoEcole = filterAutoEcole === "all" || candidate.autoEcoleId === filterAutoEcole;
      
      return matchesSearch && matchesStatus && matchesAutoEcole;
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      } else if (sortBy === "progress") {
        return b.progress - a.progress;
      } else {
        return (b.dateInscription?.seconds || 0) - (a.dateInscription?.seconds || 0);
      }
    });

  const stats = {
    total: candidates.length,
    nouveau: candidates.filter(c => c.status === "Nouveau").length,
    enCours: candidates.filter(c => c.status === "En cours").length,
    examen: candidates.filter(c => c.status === "Examen").length,
    reussi: candidates.filter(c => c.status === "Réussi").length,
    abandonne: candidates.filter(c => c.status === "Abandonné").length,
  };

  const getStatusBadge = (status: Candidate["status"]) => {
    const badges = {
      "Nouveau": "bg-blue-50 text-blue-700 border-blue-200",
      "En cours": "bg-yellow-50 text-yellow-700 border-yellow-200",
      "Examen": "bg-purple-50 text-purple-700 border-purple-200",
      "Réussi": "bg-green-50 text-green-700 border-green-200",
      "Abandonné": "bg-red-50 text-red-700 border-red-200"
    };
    return badges[status];
  };

  const getStatusIcon = (status: Candidate["status"]) => {
    switch (status) {
      case "Nouveau": return <Users className="w-4 h-4" />;
      case "En cours": return <Clock className="w-4 h-4" />;
      case "Examen": return <AlertCircle className="w-4 h-4" />;
      case "Réussi": return <CheckCircle2 className="w-4 h-4" />;
      case "Abandonné": return <X className="w-4 h-4" />;
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Accès réservé aux super administrateurs</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-8 h-8 text-blue-600" />
            Gestion des Candidats
          </h1>
          <p className="text-gray-600 mt-1">
            Gérer tous les candidats de toutes les auto-écoles
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            <UserPlus className="w-4 h-4" />
            Ajouter un candidat
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Users className="w-8 h-8 text-gray-500" />
          </div>
        </div>
        
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Nouveaux</p>
              <p className="text-2xl font-bold text-blue-700">{stats.nouveau}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600">En cours</p>
              <p className="text-2xl font-bold text-yellow-700">{stats.enCours}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600">Examen</p>
              <p className="text-2xl font-bold text-purple-700">{stats.examen}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg border border-green-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Réussis</p>
              <p className="text-2xl font-bold text-green-700">{stats.reussi}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-red-50 rounded-lg border border-red-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600">Abandonnés</p>
              <p className="text-2xl font-bold text-red-700">{stats.abandonne}</p>
            </div>
            <X className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, email, téléphone, auto-école..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          >
            <option value="all">Tous les statuts</option>
            <option value="Nouveau">Nouveau</option>
            <option value="En cours">En cours</option>
            <option value="Examen">Examen</option>
            <option value="Réussi">Réussi</option>
            <option value="Abandonné">Abandonné</option>
          </select>
          
          <select
            value={filterAutoEcole}
            onChange={(e) => setFilterAutoEcole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          >
            <option value="all">Toutes les auto-écoles</option>
            {autoEcoles.map(ae => (
              <option key={ae.id} value={ae.id}>{ae.name}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-2 mt-4">
          <span className="text-sm text-gray-600">Trier par:</span>
          <button
            onClick={() => setSortBy("date")}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              sortBy === "date" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Date d'inscription
          </button>
          <button
            onClick={() => setSortBy("name")}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              sortBy === "name" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Nom
          </button>
          <button
            onClick={() => setSortBy("progress")}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              sortBy === "progress" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Progression
          </button>
        </div>
      </div>

      {/* Candidates Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Candidat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Auto-école
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progression
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Leçons
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                      <span className="ml-2 text-gray-500">Chargement...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Aucun candidat trouvé
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                          {candidate.firstName?.charAt(0) || '?'}{candidate.lastName?.charAt(0) || '?'}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {candidate.firstName || 'N/A'} {candidate.lastName || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">{candidate.email || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{candidate.autoEcoleName}</span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-3 h-3" />
                          {candidate.phone}
                        </div>
                        {candidate.city && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-3 h-3" />
                            {candidate.city}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(candidate.status)}`}>
                        {getStatusIcon(candidate.status)}
                        {candidate.status}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{candidate.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-linear-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all"
                            style={{ width: `${candidate.progress}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <GraduationCap className="w-4 h-4" />
                          <span>{candidate.theoreticalLessons} théorique</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Car className="w-4 h-4" />
                          <span>{candidate.practicalLessons} pratique</span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedCandidate(candidate);
                            setShowDetailsModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Voir détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(candidate)}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCandidate(candidate)}
                          disabled={actionLoading === candidate.id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Supprimer"
                        >
                          {actionLoading === candidate.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full my-8">
            <div className="bg-linear-to-r from-blue-500 to-purple-500 text-white p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  {showAddModal ? <UserPlus className="w-6 h-6" /> : <Edit2 className="w-6 h-6" />}
                  {showAddModal ? "Ajouter un candidat" : "Modifier le candidat"}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setSelectedCandidate(null);
                    resetForm();
                  }}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <form onSubmit={showAddModal ? handleAddCandidate : handleUpdateCandidate} className="p-6 space-y-6 max-h-[calc(90vh-180px)] overflow-y-auto">
              {/* Auto-école Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Auto-école *
                </label>
                <select
                  value={formData.autoEcoleId}
                  onChange={(e) => setFormData({ ...formData, autoEcoleId: e.target.value })}
                  required
                  disabled={showEditModal}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 disabled:bg-gray-100"
                >
                  <option value="">Sélectionner une auto-école</option>
                  {autoEcoles.map(ae => (
                    <option key={ae.id} value={ae.id}>{ae.name}</option>
                  ))}
                </select>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="Jean"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="Dupont"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="jean.dupont@email.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="+216 XX XXX XXX"
                  />
                </div>
              </div>

              {/* Address Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Adresse
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="123 Rue de..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="Tunis"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Date de naissance
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              {/* Status and Progress */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Statut
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Candidate["status"] })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="Nouveau">Nouveau</option>
                    <option value="En cours">En cours</option>
                    <option value="Examen">Examen</option>
                    <option value="Réussi">Réussi</option>
                    <option value="Abandonné">Abandonné</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Progression (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>

              {/* Lessons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Leçons théoriques
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.theoreticalLessons}
                    onChange={(e) => setFormData({ ...formData, theoreticalLessons: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Leçons pratiques
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.practicalLessons}
                    onChange={(e) => setFormData({ ...formData, practicalLessons: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Notes supplémentaires..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setSelectedCandidate(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!!actionLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {showAddModal ? "Ajout..." : "Mise à jour..."}
                    </>
                  ) : (
                    showAddModal ? "Ajouter" : "Mettre à jour"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full my-8">
            <div className="bg-linear-to-r from-blue-500 to-purple-500 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-2xl">
                    {selectedCandidate.firstName?.charAt(0) || '?'}{selectedCandidate.lastName?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {selectedCandidate.firstName || 'N/A'} {selectedCandidate.lastName || 'N/A'}
                    </h2>
                    <p className="text-white/90">{selectedCandidate.email || 'N/A'}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedCandidate(null);
                  }}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6 max-h-[calc(90vh-180px)] overflow-y-auto">
              {/* Status Badge */}
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${getStatusBadge(selectedCandidate.status)}`}>
                  {getStatusIcon(selectedCandidate.status)}
                  {selectedCandidate.status}
                </span>
                <span className="text-sm text-gray-500">
                  {selectedCandidate.autoEcoleName}
                </span>
              </div>

              {/* Progress */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progression globale</span>
                  <span className="text-2xl font-bold text-blue-600">{selectedCandidate.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-linear-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all"
                    style={{ width: `${selectedCandidate.progress}%` }}
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <Phone className="w-5 h-5" />
                    <span className="font-medium">Téléphone</span>
                  </div>
                  <p className="text-gray-900">{selectedCandidate.phone}</p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-purple-600 mb-2">
                    <Mail className="w-5 h-5" />
                    <span className="font-medium">Email</span>
                  </div>
                  <p className="text-gray-900 break-all">{selectedCandidate.email}</p>
                </div>

                {selectedCandidate.address && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-600 mb-2">
                      <MapPin className="w-5 h-5" />
                      <span className="font-medium">Adresse</span>
                    </div>
                    <p className="text-gray-900">{selectedCandidate.address}</p>
                  </div>
                )}

                {selectedCandidate.city && (
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-yellow-600 mb-2">
                      <MapPin className="w-5 h-5" />
                      <span className="font-medium">Ville</span>
                    </div>
                    <p className="text-gray-900">{selectedCandidate.city}</p>
                  </div>
                )}
              </div>

              {/* Lessons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-600 mb-3">
                    <GraduationCap className="w-5 h-5" />
                    <span className="font-medium">Leçons théoriques</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{selectedCandidate.theoreticalLessons}</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-orange-600 mb-3">
                    <Car className="w-5 h-5" />
                    <span className="font-medium">Leçons pratiques</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{selectedCandidate.practicalLessons}</p>
                </div>
              </div>

              {/* Notes */}
              {selectedCandidate.notes && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedCandidate.notes}</p>
                </div>
              )}

              {/* Date Info */}
              {selectedCandidate.dateInscription && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Inscrit le {new Date(selectedCandidate.dateInscription.seconds * 1000).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedCandidate(null);
                }}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}
