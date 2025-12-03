"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase/config";
import { collection, getDocs, doc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import dynamic from "next/dynamic";
import SidebarPermissionsManager from "@/components/admin/SidebarPermissionsManager";
import { SidebarPermissions } from "@/lib/types";
import { 
  Building2, 
  Users, 
  Car, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Crown,
  Star,
  Circle,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  Eye,
  MoreVertical,
  Power,
  Grid3x3,
  List,
  Map,
  FileText,
  DollarSign,
  Tag,
  Clock,
  User,
  X,
  Settings
} from "lucide-react";

// Dynamically import the map component to avoid SSR issues with Leaflet
const TunisiaMap = dynamic(() => import("@/components/TunisiaMap"), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="w-full h-[500px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="text-gray-500 mt-4 text-sm">Chargement de la carte...</p>
        </div>
      </div>
    </div>
  ),
});

type PackType = "gold" | "silver" | "bronze" | null;

interface AutoEcole {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  address?: string;
  status?: "active" | "inactive" | "pending";
  pack?: PackType;
  packPaid?: boolean;
  paymentMethod?: "D17" | "Sur place";
  paymentRequestDate?: any;
  paymentStatus?: "pending" | "approved" | "rejected";
  paymentApprovedDate?: any;
  rejectionReason?: string;
  rejectionDate?: any;
  logo?: string;
  createdAt?: any;
  monthlyRevenue?: number;
  registrationNumber?: string;
  managerName?: string;
  sidebarPermissions?: SidebarPermissions;
}

export default function AutoEcolePage() {
  const { isSuperAdmin } = useAuth();
  const [autoEcoles, setAutoEcoles] = useState<AutoEcole[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPack, setFilterPack] = useState<string>("all");
  const [selectedAutoEcole, setSelectedAutoEcole] = useState<AutoEcole | null>(null);
  const [showPackModal, setShowPackModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFullDetailsModal, setShowFullDetailsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [showMap, setShowMap] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [autoEcoleDetails, setAutoEcoleDetails] = useState<any>({
    candidates: [],
    instructors: [],
    invoices: [],
    offers: [],
    appointments: []
  });
  const [activeTab, setActiveTab] = useState<"details" | "permissions">("details");

  useEffect(() => {
    loadAutoEcoles();
  }, []);

  const loadAutoEcoles = async () => {
    try {
      setLoading(true);
      const autoEcolesRef = collection(db, "autoecoles");
      const snapshot = await getDocs(autoEcolesRef);
      const autoEcolesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AutoEcole[];
      setAutoEcoles(autoEcolesData);

      // Load all candidates and instructors from all auto-écoles
      let allCandidates: any[] = [];
      let allInstructors: any[] = [];

      for (const autoEcole of autoEcolesData) {
        const candidatsRef = collection(db, "autoecoles", autoEcole.id, "candidat");
        const candidatesSnapshot = await getDocs(candidatsRef);
        candidatesSnapshot.docs.forEach(doc => {
          allCandidates.push({
            id: doc.id,
            autoEcoleId: autoEcole.id,
            autoEcoleName: autoEcole.name,
            ...doc.data()
          });
        });

        const moniteurRef = collection(db, "autoecoles", autoEcole.id, "moniteur");
        const instructorsSnapshot = await getDocs(moniteurRef);
        instructorsSnapshot.docs.forEach(doc => {
          allInstructors.push({
            id: doc.id,
            autoEcoleId: autoEcole.id,
            autoEcoleName: autoEcole.name,
            ...doc.data()
          });
        });
      }

      setCandidates(allCandidates);
      setInstructors(allInstructors);
    } catch (error) {
      console.error("Error loading auto-écoles:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAutoEcoleDetails = async (autoEcoleId: string) => {
    try {
      setDetailsLoading(true);
      
      // Load candidates
      const candidatsRef = collection(db, "autoecoles", autoEcoleId, "candidat");
      const candidatsSnapshot = await getDocs(candidatsRef);
      const candidatsData = candidatsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Load instructors
      const moniteurRef = collection(db, "autoecoles", autoEcoleId, "moniteur");
      const moniteurSnapshot = await getDocs(moniteurRef);
      const moniteurData = moniteurSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Load invoices
      const invoicesRef = collection(db, "autoecoles", autoEcoleId, "invoices");
      const invoicesSnapshot = await getDocs(invoicesRef);
      const invoicesData = invoicesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Load offers
      const offersRef = collection(db, "autoecoles", autoEcoleId, "offers");
      const offersSnapshot = await getDocs(offersRef);
      const offersData = offersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Load appointments
      const appointmentsRef = collection(db, "autoecoles", autoEcoleId, "rendezvous");
      const appointmentsSnapshot = await getDocs(appointmentsRef);
      const appointmentsData = appointmentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setAutoEcoleDetails({
        candidates: candidatsData,
        instructors: moniteurData,
        invoices: invoicesData,
        offers: offersData,
        appointments: appointmentsData
      });
    } catch (error) {
      console.error("Error loading auto-école details:", error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const updateStatus = async (status: string) => {
    if (!selectedAutoEcole || !isSuperAdmin) return;
    
    try {
      setActionLoading(selectedAutoEcole.id);
      const autoEcoleRef = doc(db, "autoecoles", selectedAutoEcole.id);
      await updateDoc(autoEcoleRef, {
        status: status,
        updatedAt: Timestamp.now()
      });
      
      setShowStatusModal(false);
      setSelectedAutoEcole(null);
      await loadAutoEcoles();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Erreur lors de la mise à jour du statut");
    } finally {
      setActionLoading(null);
    }
  };

  const updatePack = async (pack: PackType) => {
    if (!selectedAutoEcole || !isSuperAdmin) return;
    
    try {
      setActionLoading(selectedAutoEcole.id);
      const autoEcoleRef = doc(db, "autoecoles", selectedAutoEcole.id);
      await updateDoc(autoEcoleRef, {
        pack: pack,
        updatedAt: Timestamp.now()
      });
      
      setShowPackModal(false);
      setSelectedAutoEcole(null);
      await loadAutoEcoles();
    } catch (error) {
      console.error("Error updating pack:", error);
      alert("Erreur lors de la mise à jour du pack");
    } finally {
      setActionLoading(null);
    }
  };

  const updatePackPaid = async (paid: boolean) => {
    if (!selectedAutoEcole || !isSuperAdmin) return;
    
    try {
      setActionLoading(selectedAutoEcole.id);
      const autoEcoleRef = doc(db, "autoecoles", selectedAutoEcole.id);
      await updateDoc(autoEcoleRef, {
        packPaid: paid,
        updatedAt: Timestamp.now()
      });
      
      // Update local state
      setSelectedAutoEcole({
        ...selectedAutoEcole,
        packPaid: paid
      });
      
      await loadAutoEcoles();
    } catch (error) {
      console.error("Error updating pack paid status:", error);
      alert("Erreur lors de la mise à jour du statut de paiement");
    } finally {
      setActionLoading(null);
    }
  };

  const approvePayment = async () => {
    if (!selectedAutoEcole || !isSuperAdmin) return;
    
    try {
      setActionLoading(selectedAutoEcole.id);
      const autoEcoleRef = doc(db, "autoecoles", selectedAutoEcole.id);
      await updateDoc(autoEcoleRef, {
        packPaid: true,
        paymentStatus: "approved",
        paymentApprovedDate: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      setShowPaymentModal(false);
      setSelectedAutoEcole(null);
      await loadAutoEcoles();
      alert("✅ Paiement approuvé avec succès!");
    } catch (error) {
      console.error("Error approving payment:", error);
      alert("Erreur lors de l'approbation du paiement");
    } finally {
      setActionLoading(null);
    }
  };

  const rejectPayment = async () => {
    if (!selectedAutoEcole || !isSuperAdmin) return;
    
    try {
      setActionLoading(selectedAutoEcole.id);
      const autoEcoleRef = doc(db, "autoecoles", selectedAutoEcole.id);
      await updateDoc(autoEcoleRef, {
        paymentStatus: "rejected",
        rejectionReason: rejectionReason || "Aucune raison fournie",
        rejectionDate: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      setShowPaymentModal(false);
      setSelectedAutoEcole(null);
      setRejectionReason("");
      await loadAutoEcoles();
      alert("❌ Paiement rejeté");
    } catch (error) {
      console.error("Error rejecting payment:", error);
      alert("Erreur lors du rejet du paiement");
    } finally {
      setActionLoading(null);
    }
  };

  const deleteAutoEcole = async (autoEcoleId: string) => {
    if (!isSuperAdmin) return;
    
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette auto-école ? Cette action est irréversible.")) {
      return;
    }
    
    try {
      setActionLoading(autoEcoleId);
      await deleteDoc(doc(db, "autoecoles", autoEcoleId));
      await loadAutoEcoles();
    } catch (error) {
      console.error("Error deleting auto-école:", error);
      alert("Erreur lors de la suppression");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredAutoEcoles = autoEcoles.filter(ae => {
    const matchesSearch = ae.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ae.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ae.city?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || ae.status === filterStatus;
    const matchesPack = filterPack === "all" || ae.pack === filterPack;
    
    return matchesSearch && matchesStatus && matchesPack;
  });

  const getPackIcon = (pack?: PackType) => {
    switch (pack) {
      case "gold": return <Crown className="w-5 h-5 text-yellow-500" />;
      case "silver": return <Star className="w-5 h-5 text-gray-400" />;
      case "bronze": return <Circle className="w-5 h-5 text-orange-600" />;
      default: return <Circle className="w-5 h-5 text-gray-300" />;
    }
  };

  const getPackBadge = (pack?: PackType) => {
    const badges = {
      gold: "bg-yellow-50 text-yellow-700 border-yellow-200",
      silver: "bg-gray-50 text-gray-700 border-gray-200",
      bronze: "bg-orange-50 text-orange-700 border-orange-200",
      default: "bg-gray-50 text-gray-400 border-gray-200"
    };
    
    return badges[pack || "default"];
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "active":
        return "bg-green-50 text-green-700 border-green-200";
      case "inactive":
        return "bg-red-50 text-red-700 border-red-200";
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-50 text-gray-400 border-gray-200";
    }
  };

  const stats = {
    total: autoEcoles.length,
    active: autoEcoles.filter(ae => ae.status === "active").length,
    inactive: autoEcoles.filter(ae => ae.status === "inactive").length,
    pending: autoEcoles.filter(ae => ae.status === "pending").length,
    gold: autoEcoles.filter(ae => ae.pack === "gold").length,
    silver: autoEcoles.filter(ae => ae.pack === "silver").length,
    bronze: autoEcoles.filter(ae => ae.pack === "bronze").length,
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
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Auto-écoles</h1>
          <p className="text-gray-600 mt-1">
            Gérer les comptes, packs et statuts des auto-écoles
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode("cards")}
              className={`p-2 rounded ${viewMode === "cards" ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
              title="Vue cartes"
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded ${viewMode === "table" ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
              title="Vue tableau"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowMap(!showMap)}
              className={`p-2 rounded ${showMap ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
              title="Carte de Tunisie"
            >
              <Map className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={loadAutoEcoles}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Building2 className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Actives</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inactives</p>
              <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Tunisia Map - Only shown when toggled */}
      {showMap && !loading && autoEcoles.length > 0 && (
        <TunisiaMap autoEcoles={autoEcoles} />
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, email, ville..."
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
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
            <option value="pending">En attente</option>
          </select>
          
          <select
            value={filterPack}
            onChange={(e) => setFilterPack(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          >
            <option value="all">Tous les packs</option>
            <option value="gold">Gold</option>
            <option value="silver">Silver</option>
            <option value="bronze">Bronze</option>
          </select>
        </div>
      </div>

      {/* Cards View */}
      {viewMode === "cards" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-full text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mx-auto"></div>
                <p className="text-gray-500 mt-4 text-sm">Chargement...</p>
              </div>
            ) : filteredAutoEcoles.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                Aucune auto-école trouvée
              </div>
            ) : (
              filteredAutoEcoles.map((autoEcole) => {
                const schoolCandidates = candidates.filter(c => c.autoEcoleId === autoEcole.id);
                const schoolInstructors = instructors.filter(i => i.autoEcoleId === autoEcole.id);

                return (
                  <div key={autoEcole.id} className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{autoEcole.name}</h3>
                        <p className="text-xs text-gray-500">{autoEcole.city}</p>
                      </div>
                      {autoEcole.logo && (
                        <img src={autoEcole.logo} alt={autoEcole.name} className="w-10 h-10 rounded-lg object-cover" />
                      )}
                    </div>
                    
                    {/* Status & Pack Badges */}
                    <div className="flex items-center gap-2 mb-3">
                      <button
                        onClick={() => {
                          setSelectedAutoEcole(autoEcole);
                          setShowStatusModal(true);
                        }}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border hover:opacity-80 transition-opacity ${
                          autoEcole.status === "active" 
                            ? "bg-green-50 text-green-700 border-green-200" 
                            : autoEcole.status === "inactive"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-yellow-50 text-yellow-700 border-yellow-200"
                        }`}
                      >
                        {autoEcole.status === "active" ? (
                          <><CheckCircle2 className="w-3 h-3" /> Actif</>
                        ) : autoEcole.status === "inactive" ? (
                          <><XCircle className="w-3 h-3" /> Inactif</>
                        ) : (
                          <><Power className="w-3 h-3" /> En attente</>
                        )}
                      </button>
                      
                      <button
                        onClick={() => {
                          setSelectedAutoEcole(autoEcole);
                          setShowPackModal(true);
                        }}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border hover:opacity-80 transition-opacity ${getPackBadge(autoEcole.pack)}`}
                      >
                        {getPackIcon(autoEcole.pack)}
                        {autoEcole.pack ? autoEcole.pack.toUpperCase() : "PACK"}
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 flex items-center gap-1">
                          <Users className="w-4 h-4" /> Candidats
                        </span>
                        <span className="font-semibold text-gray-900">{schoolCandidates.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 flex items-center gap-1">
                          <Car className="w-4 h-4" /> Moniteurs
                        </span>
                        <span className="font-semibold text-gray-900">{schoolInstructors.length}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-3">
                        <span className="font-medium">Email:</span> {autoEcole.email}
                      </p>
                      
                      <button
                        onClick={async () => {
                          setSelectedAutoEcole(autoEcole);
                          setShowFullDetailsModal(true);
                          await loadAutoEcoleDetails(autoEcole.id);
                        }}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-sm font-medium">Voir détails complets</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Auto-école
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Localisation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pack
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payé
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
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
                      <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
                      <span className="ml-2 text-gray-500">Chargement...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredAutoEcoles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Aucune auto-école trouvée
                  </td>
                </tr>
              ) : (
                filteredAutoEcoles.map((autoEcole) => (
                  <tr key={autoEcole.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {autoEcole.logo ? (
                          <img src={autoEcole.logo} alt={autoEcole.name} className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{autoEcole.name}</p>
                          <p className="text-xs text-gray-500">{autoEcole.registrationNumber || "N/A"}</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-gray-900 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {autoEcole.email}
                        </p>
                        {autoEcole.phone && (
                          <p className="text-gray-500 flex items-center gap-1 mt-1">
                            <Phone className="w-3 h-3" /> {autoEcole.phone}
                          </p>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {autoEcole.city || "N/A"}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedAutoEcole(autoEcole);
                          setShowPackModal(true);
                        }}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getPackBadge(autoEcole.pack)} hover:opacity-80 transition-opacity`}
                      >
                        {getPackIcon(autoEcole.pack)}
                        {autoEcole.pack?.toUpperCase() || "AUCUN"}
                      </button>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {autoEcole.pack ? (
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                            autoEcole.packPaid 
                              ? "bg-green-100 text-green-800 border border-green-200" 
                              : "bg-red-100 text-red-800 border border-red-200"
                          }`}>
                            {autoEcole.packPaid ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" />
                                PAYÉ
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3" />
                                NON PAYÉ
                              </>
                            )}
                          </span>
                          {autoEcole.paymentStatus === "pending" && (
                            <button
                              onClick={() => {
                                setSelectedAutoEcole(autoEcole);
                                setShowPaymentModal(true);
                              }}
                              className="p-1 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded transition-colors"
                              title="Demande de paiement en attente"
                            >
                              <AlertCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedAutoEcole(autoEcole);
                          setShowStatusModal(true);
                        }}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadge(autoEcole.status)} hover:opacity-80 transition-opacity`}
                      >
                        {autoEcole.status === "active" ? <CheckCircle2 className="w-3 h-3" /> : autoEcole.status === "inactive" ? <XCircle className="w-3 h-3" /> : <Power className="w-3 h-3" />}
                        {autoEcole.status === "active" ? "ACTIF" : autoEcole.status === "inactive" ? "INACTIF" : "EN ATTENTE"}
                      </button>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={async () => {
                            setSelectedAutoEcole(autoEcole);
                            setShowFullDetailsModal(true);
                            await loadAutoEcoleDetails(autoEcole.id);
                          }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Voir détails complets"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteAutoEcole(autoEcole.id)}
                          disabled={actionLoading === autoEcole.id}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
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
      )}

      {/* Status Selection Modal */}
      {showStatusModal && selectedAutoEcole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Changer le Statut
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Auto-école: <span className="font-semibold">{selectedAutoEcole.name}</span>
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => updateStatus("active")}
                disabled={actionLoading === selectedAutoEcole.id}
                className="w-full flex items-center justify-between p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Actif</p>
                    <p className="text-xs text-gray-500">L'auto-école peut utiliser la plateforme</p>
                  </div>
                </div>
                {selectedAutoEcole.status === "active" && (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                )}
              </button>
              
              <button
                onClick={() => updateStatus("inactive")}
                disabled={actionLoading === selectedAutoEcole.id}
                className="w-full flex items-center justify-between p-4 border-2 border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <XCircle className="w-6 h-6 text-red-600" />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Inactif</p>
                    <p className="text-xs text-gray-500">L'auto-école est désactivée</p>
                  </div>
                </div>
                {selectedAutoEcole.status === "inactive" && (
                  <CheckCircle2 className="w-5 h-5 text-red-600" />
                )}
              </button>
              
              <button
                onClick={() => updateStatus("pending")}
                disabled={actionLoading === selectedAutoEcole.id}
                className="w-full flex items-center justify-between p-4 border-2 border-yellow-200 rounded-lg hover:bg-yellow-50 transition-colors disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <Power className="w-6 h-6 text-yellow-600" />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">En attente</p>
                    <p className="text-xs text-gray-500">En attente d'approbation</p>
                  </div>
                </div>
                {selectedAutoEcole.status === "pending" && (
                  <CheckCircle2 className="w-5 h-5 text-yellow-600" />
                )}
              </button>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedAutoEcole(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pack Selection Modal */}
      {showPackModal && selectedAutoEcole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Sélectionner un Pack
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Auto-école: <span className="font-semibold">{selectedAutoEcole.name}</span>
            </p>
            
            {/* Pack Paid Toggle */}
            {selectedAutoEcole.pack && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DollarSign className={`w-5 h-5 ${
                      selectedAutoEcole.packPaid ? "text-green-600" : "text-red-600"
                    }`} />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        Statut de paiement
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedAutoEcole.packPaid ? "Pack payé" : "Pack non payé"}
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedAutoEcole.packPaid || false}
                      onChange={(e) => updatePackPaid(e.target.checked)}
                      disabled={actionLoading === selectedAutoEcole.id}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <button
                onClick={() => updatePack(null)}
                disabled={actionLoading === selectedAutoEcole.id}
                className="w-full flex items-center justify-between p-4 border-2 border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <XCircle className="w-6 h-6 text-red-500" />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Aucun Pack</p>
                    <p className="text-xs text-gray-500">Désactiver le pack actuel</p>
                  </div>
                </div>
                {!selectedAutoEcole.pack && (
                  <CheckCircle2 className="w-5 h-5 text-red-500" />
                )}
              </button>

              <button
                onClick={() => updatePack("gold")}
                disabled={actionLoading === selectedAutoEcole.id}
                className="w-full flex items-center justify-between p-4 border-2 border-yellow-200 rounded-lg hover:bg-yellow-50 transition-colors disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <Crown className="w-6 h-6 text-yellow-500" />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Pack Gold</p>
                    <p className="text-xs text-gray-500">Premium - Toutes les fonctionnalités</p>
                  </div>
                </div>
                {selectedAutoEcole.pack === "gold" && (
                  <CheckCircle2 className="w-5 h-5 text-yellow-500" />
                )}
              </button>
              
              <button
                onClick={() => updatePack("silver")}
                disabled={actionLoading === selectedAutoEcole.id}
                className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <Star className="w-6 h-6 text-gray-400" />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Pack Silver</p>
                    <p className="text-xs text-gray-500">Avancé - Fonctionnalités principales</p>
                  </div>
                </div>
                {selectedAutoEcole.pack === "silver" && (
                  <CheckCircle2 className="w-5 h-5 text-gray-400" />
                )}
              </button>
              
              <button
                onClick={() => updatePack("bronze")}
                disabled={actionLoading === selectedAutoEcole.id}
                className="w-full flex items-center justify-between p-4 border-2 border-orange-200 rounded-lg hover:bg-orange-50 transition-colors disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <Circle className="w-6 h-6 text-orange-600" />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Pack Bronze</p>
                    <p className="text-xs text-gray-500">Essentiel - Fonctionnalités de base</p>
                  </div>
                </div>
                {selectedAutoEcole.pack === "bronze" && (
                  <CheckCircle2 className="w-5 h-5 text-orange-600" />
                )}
              </button>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowPackModal(false);
                  setSelectedAutoEcole(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedAutoEcole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">
                Détails de l'Auto-école
              </h3>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedAutoEcole(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {selectedAutoEcole.logo ? (
                  <img src={selectedAutoEcole.logo} alt={selectedAutoEcole.name} className="w-20 h-20 rounded-lg object-cover" />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Building2 className="w-10 h-10 text-gray-400" />
                  </div>
                )}
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{selectedAutoEcole.name}</h4>
                  <p className="text-sm text-gray-500">{selectedAutoEcole.registrationNumber || "N/A"}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">{selectedAutoEcole.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Téléphone</p>
                  <p className="text-sm font-medium text-gray-900">{selectedAutoEcole.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Ville</p>
                  <p className="text-sm font-medium text-gray-900">{selectedAutoEcole.city || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Adresse</p>
                  <p className="text-sm font-medium text-gray-900">{selectedAutoEcole.address || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Pack</p>
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getPackBadge(selectedAutoEcole.pack)}`}>
                    {getPackIcon(selectedAutoEcole.pack)}
                    {selectedAutoEcole.pack?.toUpperCase() || "AUCUN"}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Statut</p>
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(selectedAutoEcole.status)}`}>
                    {selectedAutoEcole.status === "active" ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {selectedAutoEcole.status?.toUpperCase() || "N/A"}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Revenu Mensuel</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedAutoEcole.monthlyRevenue ? `${selectedAutoEcole.monthlyRevenue.toLocaleString()} TND` : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Candidats</p>
                  <p className="text-sm font-medium text-gray-900">
                    {candidates.filter(c => c.autoEcoleId === selectedAutoEcole.id).length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Moniteurs</p>
                  <p className="text-sm font-medium text-gray-900">
                    {instructors.filter(i => i.autoEcoleId === selectedAutoEcole.id).length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Date de création</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedAutoEcole.createdAt ? new Date(selectedAutoEcole.createdAt.toDate()).toLocaleDateString('fr-FR') : "N/A"}
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => {
                setShowDetailsModal(false);
                setSelectedAutoEcole(null);
              }}
              className="w-full mt-6 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Full Details Modal with Tabs */}
      {showFullDetailsModal && selectedAutoEcole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-orange-500 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {selectedAutoEcole.logo ? (
                    <img src={selectedAutoEcole.logo} alt={selectedAutoEcole.name} className="w-16 h-16 rounded-lg object-cover border-2 border-white" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-white/20 flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-white" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold">{selectedAutoEcole.name}</h2>
                    <p className="text-white/90 text-sm">{selectedAutoEcole.city} • {selectedAutoEcole.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowFullDetailsModal(false);
                    setSelectedAutoEcole(null);
                  }}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 px-6">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab("details")}
                  className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                    activeTab === "details"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  📊 Détails & Statistiques
                </button>
                <button
                  onClick={() => setActiveTab("permissions")}
                  className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                    activeTab === "permissions"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  ⚙️ Gestion du Sidebar
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {detailsLoading && activeTab === "details" ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <RefreshCw className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Chargement des détails...</p>
                  </div>
                </div>
              ) : activeTab === "permissions" ? (
                <SidebarPermissionsManager
                  autoEcoleId={selectedAutoEcole.id}
                  autoEcoleName={selectedAutoEcole.name}
                  currentPack={selectedAutoEcole.pack}
                  currentPermissions={selectedAutoEcole.sidebarPermissions}
                  onUpdate={loadAutoEcoles}
                />
              ) : (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-blue-600 font-medium">Candidats</p>
                          <p className="text-2xl font-bold text-blue-900">{autoEcoleDetails.candidates.length}</p>
                        </div>
                        <Users className="w-8 h-8 text-blue-500" />
                      </div>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-green-600 font-medium">Moniteurs</p>
                          <p className="text-2xl font-bold text-green-900">{autoEcoleDetails.instructors.length}</p>
                        </div>
                        <Car className="w-8 h-8 text-green-500" />
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-purple-600 font-medium">Factures</p>
                          <p className="text-2xl font-bold text-purple-900">{autoEcoleDetails.invoices.length}</p>
                        </div>
                        <FileText className="w-8 h-8 text-purple-500" />
                      </div>
                    </div>
                    
                    <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-orange-600 font-medium">Offres</p>
                          <p className="text-2xl font-bold text-orange-900">{autoEcoleDetails.offers.length}</p>
                        </div>
                        <Tag className="w-8 h-8 text-orange-500" />
                      </div>
                    </div>
                    
                    <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-pink-600 font-medium">Rendez-vous</p>
                          <p className="text-2xl font-bold text-pink-900">{autoEcoleDetails.appointments.length}</p>
                        </div>
                        <Clock className="w-8 h-8 text-pink-500" />
                      </div>
                    </div>
                  </div>

                  {/* Candidates Section */}
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-blue-50 px-4 py-3 border-b border-blue-200">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        Candidats ({autoEcoleDetails.candidates.length})
                      </h3>
                    </div>
                    <div className="p-4">
                      {autoEcoleDetails.candidates.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Aucun candidat</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Nom</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Email</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Téléphone</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Statut</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {autoEcoleDetails.candidates.slice(0, 10).map((candidate: any) => (
                                <tr key={candidate.id} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 text-sm text-gray-900">{candidate.nom} {candidate.prenom}</td>
                                  <td className="px-4 py-3 text-sm text-gray-600">{candidate.email || "N/A"}</td>
                                  <td className="px-4 py-3 text-sm text-gray-600">{candidate.telephone || "N/A"}</td>
                                  <td className="px-4 py-3">
                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                      candidate.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                                    }`}>
                                      {candidate.status || "N/A"}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600">
                                    {candidate.createdAt ? new Date(candidate.createdAt.toDate()).toLocaleDateString('fr-FR') : "N/A"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {autoEcoleDetails.candidates.length > 10 && (
                            <p className="text-center text-sm text-gray-500 mt-4">
                              +{autoEcoleDetails.candidates.length - 10} autres candidats
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Instructors Section */}
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-green-50 px-4 py-3 border-b border-green-200">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Car className="w-5 h-5 text-green-600" />
                        Moniteurs ({autoEcoleDetails.instructors.length})
                      </h3>
                    </div>
                    <div className="p-4">
                      {autoEcoleDetails.instructors.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Aucun moniteur</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {autoEcoleDetails.instructors.map((instructor: any) => (
                            <div key={instructor.id} className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                  <User className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900">{instructor.nom} {instructor.prenom}</h4>
                                  <p className="text-sm text-gray-600">{instructor.email || "N/A"}</p>
                                  <p className="text-xs text-gray-500">{instructor.telephone || "N/A"}</p>
                                </div>
                                <div className="text-right">
                                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                    instructor.status === "Disponible" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                                  }`}>
                                    {instructor.status || "N/A"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Invoices Section */}
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-purple-50 px-4 py-3 border-b border-purple-200">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-purple-600" />
                        Factures ({autoEcoleDetails.invoices.length})
                      </h3>
                    </div>
                    <div className="p-4">
                      {autoEcoleDetails.invoices.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Aucune facture</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">N° Facture</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Client</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Montant</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Statut</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {autoEcoleDetails.invoices.slice(0, 10).map((invoice: any) => (
                                <tr key={invoice.id} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{invoice.invoiceNumber || invoice.id.slice(0, 8)}</td>
                                  <td className="px-4 py-3 text-sm text-gray-600">{invoice.clientName || "N/A"}</td>
                                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">{invoice.amount ? `${invoice.amount} TND` : "N/A"}</td>
                                  <td className="px-4 py-3">
                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                      invoice.status === "paid" ? "bg-green-100 text-green-700" : 
                                      invoice.status === "pending" ? "bg-yellow-100 text-yellow-700" : 
                                      "bg-red-100 text-red-700"
                                    }`}>
                                      {invoice.status || "N/A"}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600">
                                    {invoice.createdAt ? new Date(invoice.createdAt.toDate()).toLocaleDateString('fr-FR') : "N/A"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {autoEcoleDetails.invoices.length > 10 && (
                            <p className="text-center text-sm text-gray-500 mt-4">
                              +{autoEcoleDetails.invoices.length - 10} autres factures
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Offers Section */}
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-orange-50 px-4 py-3 border-b border-orange-200">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Tag className="w-5 h-5 text-orange-600" />
                        Offres ({autoEcoleDetails.offers.length})
                      </h3>
                    </div>
                    <div className="p-4">
                      {autoEcoleDetails.offers.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Aucune offre</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {autoEcoleDetails.offers.map((offer: any) => (
                            <div key={offer.id} className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold text-gray-900">{offer.title || offer.name || "Offre"}</h4>
                                <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-medium">
                                  {offer.discount || offer.price || "N/A"}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{offer.description || "Aucune description"}</p>
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>Valide jusqu'au: {offer.validUntil ? new Date(offer.validUntil.toDate()).toLocaleDateString('fr-FR') : "N/A"}</span>
                                <span className={`px-2 py-1 rounded ${offer.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                                  {offer.active ? "Active" : "Inactive"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Appointments Section */}
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-pink-50 px-4 py-3 border-b border-pink-200">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-pink-600" />
                        Rendez-vous ({autoEcoleDetails.appointments.length})
                      </h3>
                    </div>
                    <div className="p-4">
                      {autoEcoleDetails.appointments.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Aucun rendez-vous</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Candidat</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Moniteur</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date & Heure</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Type</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Statut</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {autoEcoleDetails.appointments.slice(0, 10).map((appointment: any) => (
                                <tr key={appointment.id} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 text-sm text-gray-900">{appointment.candidatName || "N/A"}</td>
                                  <td className="px-4 py-3 text-sm text-gray-600">{appointment.moniteurName || "N/A"}</td>
                                  <td className="px-4 py-3 text-sm text-gray-900">
                                    {appointment.date && appointment.time ? 
                                      `${new Date(appointment.date.toDate()).toLocaleDateString('fr-FR')} à ${appointment.time}` : 
                                      "N/A"}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600">{appointment.type || "Leçon"}</td>
                                  <td className="px-4 py-3">
                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                      appointment.status === "confirmed" ? "bg-green-100 text-green-700" : 
                                      appointment.status === "pending" ? "bg-yellow-100 text-yellow-700" : 
                                      "bg-gray-100 text-gray-700"
                                    }`}>
                                      {appointment.status || "N/A"}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {autoEcoleDetails.appointments.length > 10 && (
                            <p className="text-center text-sm text-gray-500 mt-4">
                              +{autoEcoleDetails.appointments.length - 10} autres rendez-vous
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <button
                onClick={() => {
                  setShowFullDetailsModal(false);
                  setSelectedAutoEcole(null);
                }}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Request Modal */}
      {showPaymentModal && selectedAutoEcole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-orange-600" />
                Demande de Paiement
              </h3>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedAutoEcole(null);
                  setRejectionReason("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 font-medium mb-1">Auto-école</p>
                <p className="text-lg font-bold text-blue-900">{selectedAutoEcole.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Pack</p>
                  <p className="font-semibold text-gray-900">{selectedAutoEcole.pack?.toUpperCase() || "AUCUN"}</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Méthode de paiement</p>
                  <p className="font-semibold text-gray-900">{selectedAutoEcole.paymentMethod || "Non spécifiée"}</p>
                </div>
              </div>

              {selectedAutoEcole.paymentRequestDate && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Date de demande</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedAutoEcole.paymentRequestDate.toDate()).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-sm text-orange-800">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  Cette auto-école a demandé la validation de son paiement
                </p>
              </div>
            </div>

            {/* Rejection Reason Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Raison de rejet (optionnel)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Si vous rejetez, vous pouvez indiquer une raison..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={rejectPayment}
                disabled={actionLoading === selectedAutoEcole.id}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-medium"
              >
                <XCircle className="w-5 h-5" />
                Rejeter
              </button>
              
              <button
                onClick={approvePayment}
                disabled={actionLoading === selectedAutoEcole.id}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-medium"
              >
                <CheckCircle2 className="w-5 h-5" />
                Approuver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
