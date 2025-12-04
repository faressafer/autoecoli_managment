"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import {
  FileText,
  Building2,
  Calendar,
  DollarSign,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  Download,
  Edit,
  Trash2,
  Plus,
  Search,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  X,
  Car,
  Shield,
  Award,
  Package,
  Crown,
  Star,
  Circle
} from "lucide-react";

interface AutoEcoleContract {
  id: string;
  autoEcoleName: string;
  autoEcoleId: string;
  contractNumber: string;
  pack: "gold" | "silver" | "bronze" | null;
  status: "active" | "suspended" | "terminated" | "pending";
  signedDate: string;
  startDate: string;
  endDate: string;
  monthlyFee: number;
  setupFee: number;
  commission: number;
  maxCandidates: number;
  maxInstructors: number;
  features: string[];
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  address: string;
  city: string;
  currentUsage: {
    candidates: number;
    instructors: number;
    revenue: number;
  };
  paymentStatus: "current" | "overdue" | "suspended";
  lastPaymentDate: string;
  notes: string;
}

export default function ContratAutoecole() {
  const { isSuperAdmin, adminProfile, autoEcole } = useAuth();

  const [contracts, setContracts] = useState<AutoEcoleContract[]>([
    {
      id: "1",
      autoEcoleName: "Auto-École Elite Tunis",
      autoEcoleId: "AE001",
      contractNumber: "SVC-2024-001",
      pack: "gold",
      status: "active",
      signedDate: "2024-01-15",
      startDate: "2024-02-01",
      endDate: "2025-01-31",
      monthlyFee: 2500,
      setupFee: 5000,
      commission: 8,
      maxCandidates: 500,
      maxInstructors: 20,
      features: ["Gestion complète", "Application mobile", "Support prioritaire", "Formation illimitée", "Analytics avancés"],
      contact: {
        name: "Mohamed Salhi",
        email: "m.salhi@elite-tunis.tn",
        phone: "+216 71 234 567"
      },
      address: "Avenue Habib Bourguiba",
      city: "Tunis",
      currentUsage: {
        candidates: 342,
        instructors: 15,
        revenue: 185000
      },
      paymentStatus: "current",
      lastPaymentDate: "2024-06-01",
      notes: "Client premium - Excellent historique de paiement"
    },
    {
      id: "2",
      autoEcoleName: "Permis Plus Sfax",
      autoEcoleId: "AE002",
      contractNumber: "SVC-2024-002",
      pack: "silver",
      status: "active",
      signedDate: "2024-02-20",
      startDate: "2024-03-01",
      endDate: "2025-02-28",
      monthlyFee: 1500,
      setupFee: 3000,
      commission: 10,
      maxCandidates: 300,
      maxInstructors: 12,
      features: ["Gestion candidats", "Planning moniteurs", "Facturation", "Support standard"],
      contact: {
        name: "Fatma Ben Ali",
        email: "f.benali@permisplus.tn",
        phone: "+216 74 123 456"
      },
      address: "Route de Tunis",
      city: "Sfax",
      currentUsage: {
        candidates: 198,
        instructors: 9,
        revenue: 95000
      },
      paymentStatus: "current",
      lastPaymentDate: "2024-06-05",
      notes: "Bon client - Paiements réguliers"
    },
    {
      id: "3",
      autoEcoleName: "Conduite Rapide Sousse",
      autoEcoleId: "AE003",
      contractNumber: "SVC-2024-003",
      pack: "bronze",
      status: "active",
      signedDate: "2024-03-10",
      startDate: "2024-04-01",
      endDate: "2025-03-31",
      monthlyFee: 800,
      setupFee: 1500,
      commission: 12,
      maxCandidates: 150,
      maxInstructors: 6,
      features: ["Gestion basique", "Planning simple", "Facturation manuelle"],
      contact: {
        name: "Ahmed Trabelsi",
        email: "a.trabelsi@conduite-sousse.tn",
        phone: "+216 73 234 567"
      },
      address: "Avenue Hedi Chaker",
      city: "Sousse",
      currentUsage: {
        candidates: 87,
        instructors: 4,
        revenue: 42000
      },
      paymentStatus: "current",
      lastPaymentDate: "2024-06-03",
      notes: "Nouveau client - Croissance régulière"
    },
    {
      id: "4",
      autoEcoleName: "Auto-École Nationale Bizerte",
      autoEcoleId: "AE004",
      contractNumber: "SVC-2023-089",
      pack: "silver",
      status: "suspended",
      signedDate: "2023-05-15",
      startDate: "2023-06-01",
      endDate: "2024-05-31",
      monthlyFee: 1500,
      setupFee: 3000,
      commission: 10,
      maxCandidates: 300,
      maxInstructors: 12,
      features: ["Gestion candidats", "Planning moniteurs", "Facturation", "Support standard"],
      contact: {
        name: "Karim Sassi",
        email: "k.sassi@nationale-bizerte.tn",
        phone: "+216 72 345 678"
      },
      address: "Rue de la République",
      city: "Bizerte",
      currentUsage: {
        candidates: 156,
        instructors: 8,
        revenue: 68000
      },
      paymentStatus: "overdue",
      lastPaymentDate: "2024-03-01",
      notes: "Suspendu pour non-paiement - 3 mois de retard"
    },
    {
      id: "5",
      autoEcoleName: "Excellence Drive Nabeul",
      autoEcoleId: "AE005",
      contractNumber: "SVC-2024-004",
      pack: null,
      status: "pending",
      signedDate: "2024-06-15",
      startDate: "2024-07-01",
      endDate: "2025-06-30",
      monthlyFee: 2000,
      setupFee: 4000,
      commission: 9,
      maxCandidates: 400,
      maxInstructors: 15,
      features: ["En cours de configuration"],
      contact: {
        name: "Leila Mejri",
        email: "l.mejri@excellence-nabeul.tn",
        phone: "+216 72 456 789"
      },
      address: "Avenue Farhat Hached",
      city: "Nabeul",
      currentUsage: {
        candidates: 0,
        instructors: 0,
        revenue: 0
      },
      paymentStatus: "current",
      lastPaymentDate: "",
      notes: "En attente d'activation - Paiement initial reçu"
    },
    {
      id: "6",
      autoEcoleName: "Permis Facile Gabès",
      autoEcoleId: "AE006",
      contractNumber: "SVC-2023-067",
      pack: "bronze",
      status: "terminated",
      signedDate: "2023-03-20",
      startDate: "2023-04-01",
      endDate: "2024-03-31",
      monthlyFee: 800,
      setupFee: 1500,
      commission: 12,
      maxCandidates: 150,
      maxInstructors: 6,
      features: ["Gestion basique", "Planning simple", "Facturation manuelle"],
      contact: {
        name: "Sami Karoui",
        email: "s.karoui@permisfacile.tn",
        phone: "+216 75 567 890"
      },
      address: "Route de Sfax",
      city: "Gabès",
      currentUsage: {
        candidates: 45,
        instructors: 3,
        revenue: 18000
      },
      paymentStatus: "suspended",
      lastPaymentDate: "2024-02-01",
      notes: "Contrat résilié - Non-renouvellement"
    }
  ]);

  const [selectedContract, setSelectedContract] = useState<AutoEcoleContract | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPack, setFilterPack] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.autoEcoleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPack = filterPack === "all" || contract.pack === filterPack;
    const matchesStatus = filterStatus === "all" || contract.status === filterStatus;
    return matchesSearch && matchesPack && matchesStatus;
  });

  const stats = {
    total: contracts.length,
    active: contracts.filter(c => c.status === "active").length,
    suspended: contracts.filter(c => c.status === "suspended").length,
    monthlyRevenue: contracts.filter(c => c.status === "active").reduce((sum, c) => sum + c.monthlyFee, 0),
    totalRevenue: contracts.reduce((sum, c) => sum + c.currentUsage.revenue, 0),
    totalCandidates: contracts.reduce((sum, c) => sum + c.currentUsage.candidates, 0)
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-700 border-green-200";
      case "suspended": return "bg-red-100 text-red-700 border-red-200";
      case "terminated": return "bg-gray-100 text-gray-700 border-gray-200";
      case "pending": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle2 className="w-3 h-3" />;
      case "suspended": return <XCircle className="w-3 h-3" />;
      case "terminated": return <AlertTriangle className="w-3 h-3" />;
      case "pending": return <Clock className="w-3 h-3" />;
      default: return <FileText className="w-3 h-3" />;
    }
  };

  const getPackBadge = (pack: string | null) => {
    const badges = {
      gold: "bg-yellow-100 text-yellow-700 border-yellow-200",
      silver: "bg-gray-100 text-gray-700 border-gray-200",
      bronze: "bg-orange-100 text-orange-700 border-orange-200"
    };
    return pack ? badges[pack as keyof typeof badges] : "bg-gray-50 text-gray-400 border-gray-200";
  };

  const getPackIcon = (pack: string | null) => {
    switch (pack) {
      case "gold": return <Crown className="w-3 h-3" />;
      case "silver": return <Star className="w-3 h-3" />;
      case "bronze": return <Circle className="w-3 h-3" />;
      default: return <Package className="w-3 h-3" />;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "current": return "bg-green-100 text-green-700 border-green-200";
      case "overdue": return "bg-red-100 text-red-700 border-red-200";
      case "suspended": return "bg-gray-100 text-gray-700 border-gray-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contrats Auto-Écoles</h1>
          <p className="text-gray-600 mt-1">
            Gestion des contrats de service avec les auto-écoles partenaires
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouveau Contrat
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Contrats</p>
            <Building2 className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500 mt-1">
            {stats.active} actifs • {stats.suspended} suspendus
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Revenu Mensuel</p>
            <DollarSign className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">
            {stats.monthlyRevenue.toLocaleString()} TND
          </p>
          <p className="text-xs text-gray-500 mt-1">Contrats actifs</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Revenu Total</p>
            <TrendingUp className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {(stats.totalRevenue / 1000).toFixed(0)}K TND
          </p>
          <p className="text-xs text-gray-500 mt-1">Tous contrats</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Candidats Totaux</p>
            <Users className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalCandidates}</p>
          <p className="text-xs text-gray-500 mt-1">Toutes auto-écoles</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, ville..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>

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

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="pending">En attente</option>
            <option value="suspended">Suspendu</option>
            <option value="terminated">Résilié</option>
          </select>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Auto-École</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pack</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarif</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paiement</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredContracts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Aucun contrat trouvé
                  </td>
                </tr>
              ) : (
                filteredContracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{contract.autoEcoleName}</p>
                          <p className="text-xs text-gray-500">{contract.city}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getPackBadge(contract.pack)}`}>
                        {getPackIcon(contract.pack)}
                        {contract.pack ? contract.pack.toUpperCase() : "N/A"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {contract.monthlyFee.toLocaleString()} TND/mois
                        </p>
                        <p className="text-xs text-gray-500">Commission: {contract.commission}%</p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Users className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-600">
                            {contract.currentUsage.candidates}/{contract.maxCandidates} candidats
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Car className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-600">
                            {contract.currentUsage.instructors}/{contract.maxInstructors} moniteurs
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getPaymentBadge(contract.paymentStatus)}`}>
                        {contract.paymentStatus === "current" ? "À jour" :
                         contract.paymentStatus === "overdue" ? "En retard" : "Suspendu"}
                      </span>
                      {contract.lastPaymentDate && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(contract.lastPaymentDate).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(contract.status)}`}>
                        {getStatusIcon(contract.status)}
                        {contract.status === "active" ? "Actif" :
                         contract.status === "suspended" ? "Suspendu" :
                         contract.status === "pending" ? "En attente" : "Résilié"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedContract(contract);
                            setShowDetailsModal(true);
                          }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Voir détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Télécharger">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors" title="Modifier">
                          <Edit className="w-4 h-4" />
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

      {/* Details Modal */}
      {showDetailsModal && selectedContract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-linear-to-r from-blue-500 to-purple-500 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-lg bg-white/20 flex items-center justify-center">
                    <Building2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{selectedContract.autoEcoleName}</h2>
                    <p className="text-white/90 text-sm">Contrat N° {selectedContract.contractNumber}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedContract(null);
                  }}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] space-y-6">
              {/* Contract Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Pack souscrit</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getPackBadge(selectedContract.pack)}`}>
                    {getPackIcon(selectedContract.pack)}
                    {selectedContract.pack ? selectedContract.pack.toUpperCase() : "AUCUN"}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Statut</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(selectedContract.status)}`}>
                    {getStatusIcon(selectedContract.status)}
                    {selectedContract.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Financial Info */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-sm font-bold text-green-900 mb-3">Informations Financières</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-green-700 mb-1">Mensuel</p>
                    <p className="text-lg font-bold text-green-900">{selectedContract.monthlyFee.toLocaleString()} TND</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-700 mb-1">Installation</p>
                    <p className="text-lg font-bold text-green-900">{selectedContract.setupFee.toLocaleString()} TND</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-700 mb-1">Commission</p>
                    <p className="text-lg font-bold text-green-900">{selectedContract.commission}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-700 mb-1">Revenu généré</p>
                    <p className="text-lg font-bold text-green-900">{selectedContract.currentUsage.revenue.toLocaleString()} TND</p>
                  </div>
                </div>
              </div>

              {/* Usage Metrics */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3">Utilisation Actuelle</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-blue-700 font-medium">Candidats</p>
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-blue-900">{selectedContract.currentUsage.candidates}</p>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-blue-700 mb-1">
                        <span>Capacité</span>
                        <span>{((selectedContract.currentUsage.candidates / selectedContract.maxCandidates) * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(selectedContract.currentUsage.candidates / selectedContract.maxCandidates) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-purple-700 font-medium">Moniteurs</p>
                      <Car className="w-4 h-4 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-purple-900">{selectedContract.currentUsage.instructors}</p>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-purple-700 mb-1">
                        <span>Capacité</span>
                        <span>{((selectedContract.currentUsage.instructors / selectedContract.maxInstructors) * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-purple-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full" 
                          style={{ width: `${(selectedContract.currentUsage.instructors / selectedContract.maxInstructors) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="text-sm font-bold text-orange-900 mb-3">Fonctionnalités Incluses</h3>
                <div className="grid grid-cols-2 gap-2">
                  {selectedContract.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 bg-white p-2 rounded border border-orange-200">
                      <CheckCircle2 className="w-4 h-4 text-orange-600" />
                      <span className="text-sm text-orange-900">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-bold text-blue-900 mb-3">Contact</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-blue-700">Responsable</p>
                      <p className="text-sm font-medium text-blue-900">{selectedContract.contact.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-blue-700">Email</p>
                      <p className="text-sm font-medium text-blue-900">{selectedContract.contact.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-blue-700">Téléphone</p>
                      <p className="text-sm font-medium text-blue-900">{selectedContract.contact.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-blue-700">Adresse</p>
                      <p className="text-sm font-medium text-blue-900">{selectedContract.address}, {selectedContract.city}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedContract.notes && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="text-sm font-bold text-yellow-900 mb-2">Notes</h3>
                  <p className="text-sm text-yellow-800">{selectedContract.notes}</p>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 p-4 bg-gray-50 flex gap-3">
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Modifier
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                <Download className="w-4 h-4 inline mr-2" />
                PDF
              </button>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedContract(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
