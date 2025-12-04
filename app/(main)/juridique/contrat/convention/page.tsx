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
  Filter,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  FileCheck,
  X,
  Briefcase,
  Shield,
  Award
} from "lucide-react";

interface ConventionContract {
  id: string;
  companyName: string;
  companyLogo?: string;
  contractNumber: string;
  type: "formation" | "recrutement" | "partenariat" | "sponsoring";
  status: "active" | "expired" | "pending" | "terminated";
  signedDate: string;
  startDate: string;
  endDate: string;
  value: number;
  paymentStatus: "paid" | "partial" | "unpaid";
  numberOfEmployees: number;
  discountRate: number;
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  address: string;
  registrations: number;
  revenue: number;
  documents: string[];
  notes: string;
}

export default function ContratConvention() {
  const { isSuperAdmin, adminProfile, autoEcole } = useAuth();

  const [contracts, setContracts] = useState<ConventionContract[]>([
    {
      id: "1",
      companyName: "TechCorp Solutions",
      contractNumber: "CONV-2024-001",
      type: "formation",
      status: "active",
      signedDate: "2024-01-15",
      startDate: "2024-02-01",
      endDate: "2025-01-31",
      value: 75000,
      paymentStatus: "paid",
      numberOfEmployees: 150,
      discountRate: 25,
      contact: {
        name: "Mohamed Benali",
        email: "m.benali@techcorp.tn",
        phone: "+216 71 234 567"
      },
      address: "Zone industrielle, Ariana, Tunisie",
      registrations: 45,
      revenue: 67500,
      documents: ["Convention signée", "Annexe tarifaire", "Liste employés"],
      notes: "Convention de formation pour permis B et C"
    },
    {
      id: "2",
      companyName: "Banque Nationale de Tunisie",
      contractNumber: "CONV-2024-002",
      type: "partenariat",
      status: "active",
      signedDate: "2023-12-01",
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      value: 120000,
      paymentStatus: "partial",
      numberOfEmployees: 500,
      discountRate: 30,
      contact: {
        name: "Fatma Saidi",
        email: "f.saidi@bnt.tn",
        phone: "+216 71 345 678"
      },
      address: "Avenue Habib Bourguiba, Tunis",
      registrations: 78,
      revenue: 98000,
      documents: ["Convention cadre", "Conditions générales", "Protocole accord"],
      notes: "Partenariat bancaire avec avantages exclusifs"
    },
    {
      id: "3",
      companyName: "Hôtel Royal Palace",
      contractNumber: "CONV-2024-003",
      type: "recrutement",
      status: "active",
      signedDate: "2024-03-10",
      startDate: "2024-04-01",
      endDate: "2024-09-30",
      value: 35000,
      paymentStatus: "paid",
      numberOfEmployees: 80,
      discountRate: 20,
      contact: {
        name: "Ahmed Trabelsi",
        email: "a.trabelsi@royalpalace.tn",
        phone: "+216 71 456 789"
      },
      address: "Avenue Mohamed V, Hammamet",
      registrations: 22,
      revenue: 28000,
      documents: ["Contrat recrutement", "Cahier des charges"],
      notes: "Formation permis tourisme pour nouveaux employés"
    },
    {
      id: "4",
      companyName: "Société de Transport Express",
      contractNumber: "CONV-2023-089",
      type: "formation",
      status: "expired",
      signedDate: "2023-01-20",
      startDate: "2023-02-01",
      endDate: "2024-01-31",
      value: 95000,
      paymentStatus: "paid",
      numberOfEmployees: 200,
      discountRate: 35,
      contact: {
        name: "Karim Ben Salah",
        email: "k.bensalah@express-tn.com",
        phone: "+216 71 567 890"
      },
      address: "Zone logistique, Ben Arous",
      registrations: 65,
      revenue: 92000,
      documents: ["Convention expirée", "Rapport final", "Attestations"],
      notes: "Convention expirée - À renouveler"
    },
    {
      id: "5",
      companyName: "Société Industrielle du Nord",
      contractNumber: "CONV-2024-004",
      type: "sponsoring",
      status: "pending",
      signedDate: "2024-06-15",
      startDate: "2024-07-01",
      endDate: "2025-06-30",
      value: 50000,
      paymentStatus: "unpaid",
      numberOfEmployees: 120,
      discountRate: 15,
      contact: {
        name: "Leila Mejri",
        email: "l.mejri@sin.tn",
        phone: "+216 72 123 456"
      },
      address: "Route de Bizerte, Menzel Bourguiba",
      registrations: 0,
      revenue: 0,
      documents: ["Projet de convention", "Proposition commerciale"],
      notes: "En attente de signature finale"
    },
    {
      id: "6",
      companyName: "Groupe Pharmaceutique Tunisia",
      contractNumber: "CONV-2024-005",
      type: "formation",
      status: "terminated",
      signedDate: "2024-02-01",
      startDate: "2024-03-01",
      endDate: "2024-08-31",
      value: 40000,
      paymentStatus: "partial",
      numberOfEmployees: 90,
      discountRate: 18,
      contact: {
        name: "Sami Karoui",
        email: "s.karoui@pharma-tn.com",
        phone: "+216 71 678 901"
      },
      address: "Parc technologique, Sfax",
      registrations: 18,
      revenue: 22000,
      documents: ["Convention résiliée", "Avenant résiliation"],
      notes: "Résiliation anticipée - Litige commercial"
    }
  ]);

  const [selectedContract, setSelectedContract] = useState<ConventionContract | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.contact.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || contract.type === filterType;
    const matchesStatus = filterStatus === "all" || contract.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: contracts.length,
    active: contracts.filter(c => c.status === "active").length,
    pending: contracts.filter(c => c.status === "pending").length,
    expired: contracts.filter(c => c.status === "expired").length,
    totalValue: contracts.filter(c => c.status === "active").reduce((sum, c) => sum + c.value, 0),
    totalRevenue: contracts.reduce((sum, c) => sum + c.revenue, 0),
    totalRegistrations: contracts.reduce((sum, c) => sum + c.registrations, 0)
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700 border-green-200";
      case "expired":
        return "bg-red-100 text-red-700 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "terminated":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle2 className="w-3 h-3" />;
      case "expired": return <XCircle className="w-3 h-3" />;
      case "pending": return <Clock className="w-3 h-3" />;
      case "terminated": return <AlertTriangle className="w-3 h-3" />;
      default: return <FileText className="w-3 h-3" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const badges = {
      formation: "bg-blue-100 text-blue-700 border-blue-200",
      recrutement: "bg-purple-100 text-purple-700 border-purple-200",
      partenariat: "bg-orange-100 text-orange-700 border-orange-200",
      sponsoring: "bg-pink-100 text-pink-700 border-pink-200"
    };
    return badges[type as keyof typeof badges] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "formation": return <Award className="w-3 h-3" />;
      case "recrutement": return <Users className="w-3 h-3" />;
      case "partenariat": return <Briefcase className="w-3 h-3" />;
      case "sponsoring": return <Shield className="w-3 h-3" />;
      default: return <FileText className="w-3 h-3" />;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700 border-green-200";
      case "partial":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "unpaid":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contrats de Convention</h1>
          <p className="text-gray-600 mt-1">
            Gestion des conventions avec les entreprises partenaires
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouvelle Convention
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Conventions</p>
            <FileText className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500 mt-1">
            {stats.active} actives • {stats.pending} en attente
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Valeur Totale</p>
            <DollarSign className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">
            {stats.totalValue.toLocaleString()} TND
          </p>
          <p className="text-xs text-gray-500 mt-1">Conventions actives</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Revenu Généré</p>
            <TrendingUp className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {stats.totalRevenue.toLocaleString()} TND
          </p>
          <p className="text-xs text-gray-500 mt-1">Toutes conventions</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Inscriptions</p>
            <Users className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalRegistrations}</p>
          <p className="text-xs text-gray-500 mt-1">Employés inscrits</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par entreprise, numéro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          >
            <option value="all">Tous les types</option>
            <option value="formation">Formation</option>
            <option value="recrutement">Recrutement</option>
            <option value="partenariat">Partenariat</option>
            <option value="sponsoring">Sponsoring</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Active</option>
            <option value="pending">En attente</option>
            <option value="expired">Expirée</option>
            <option value="terminated">Résiliée</option>
          </select>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Entreprise
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Numéro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Période
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Valeur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredContracts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    Aucune convention trouvée
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
                          <p className="text-sm font-medium text-gray-900">{contract.companyName}</p>
                          <p className="text-xs text-gray-500">{contract.numberOfEmployees} employés</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm font-mono text-gray-900">{contract.contractNumber}</p>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getTypeBadge(contract.type)}`}>
                        {getTypeIcon(contract.type)}
                        {contract.type.charAt(0).toUpperCase() + contract.type.slice(1)}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-600">
                        <p>{new Date(contract.startDate).toLocaleDateString('fr-FR')}</p>
                        <p className="text-gray-400">→ {new Date(contract.endDate).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {contract.value.toLocaleString()} TND
                        </p>
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium border mt-1 ${getPaymentBadge(contract.paymentStatus)}`}>
                          {contract.paymentStatus === "paid" ? "Payé" : 
                           contract.paymentStatus === "partial" ? "Partiel" : "Impayé"}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Users className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-600">{contract.registrations} inscriptions</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-600">{contract.revenue.toLocaleString()} TND</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-600">-{contract.discountRate}% remise</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(contract.status)}`}>
                        {getStatusIcon(contract.status)}
                        {contract.status === "active" ? "Active" :
                         contract.status === "expired" ? "Expirée" :
                         contract.status === "pending" ? "En attente" : "Résiliée"}
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
                        <button
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Télécharger"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

      {/* Details Modal */}
      {showDetailsModal && selectedContract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-linear-to-r from-blue-500 to-purple-500 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-lg bg-white/20 flex items-center justify-center">
                    <Building2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{selectedContract.companyName}</h2>
                    <p className="text-white/90 text-sm">Convention N° {selectedContract.contractNumber}</p>
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

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="space-y-6">
                {/* Contract Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Type de convention</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getTypeBadge(selectedContract.type)}`}>
                      {getTypeIcon(selectedContract.type)}
                      {selectedContract.type.toUpperCase()}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Statut</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(selectedContract.status)}`}>
                      {getStatusIcon(selectedContract.status)}
                      {selectedContract.status === "active" ? "ACTIVE" : selectedContract.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Date de signature</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(selectedContract.signedDate).toLocaleDateString('fr-FR')}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Période validité</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(selectedContract.startDate).toLocaleDateString('fr-FR')} - {new Date(selectedContract.endDate).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-bold text-blue-900 mb-3">Contact Principal</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-xs text-blue-700">Nom</p>
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
                        <p className="text-sm font-medium text-blue-900">{selectedContract.address}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financial Info */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-sm font-bold text-green-900 mb-3">Informations Financières</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-green-700 mb-1">Valeur totale</p>
                      <p className="text-lg font-bold text-green-900">{selectedContract.value.toLocaleString()} TND</p>
                    </div>
                    <div>
                      <p className="text-xs text-green-700 mb-1">Revenu généré</p>
                      <p className="text-lg font-bold text-green-900">{selectedContract.revenue.toLocaleString()} TND</p>
                    </div>
                    <div>
                      <p className="text-xs text-green-700 mb-1">Taux remise</p>
                      <p className="text-lg font-bold text-green-900">{selectedContract.discountRate}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-green-700 mb-1">Statut paiement</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPaymentBadge(selectedContract.paymentStatus)}`}>
                        {selectedContract.paymentStatus === "paid" ? "Payé" :
                         selectedContract.paymentStatus === "partial" ? "Partiel" : "Impayé"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-3">Métriques de Performance</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="w-4 h-4 text-purple-600" />
                        <p className="text-xs text-purple-700 font-medium">Employés</p>
                      </div>
                      <p className="text-2xl font-bold text-purple-900">{selectedContract.numberOfEmployees}</p>
                    </div>

                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-orange-600" />
                        <p className="text-xs text-orange-700 font-medium">Inscriptions</p>
                      </div>
                      <p className="text-2xl font-bold text-orange-900">{selectedContract.registrations}</p>
                      <p className="text-xs text-orange-700 mt-1">
                        {((selectedContract.registrations / selectedContract.numberOfEmployees) * 100).toFixed(1)}% taux participation
                      </p>
                    </div>

                    <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-pink-600" />
                        <p className="text-xs text-pink-700 font-medium">ROI</p>
                      </div>
                      <p className="text-2xl font-bold text-pink-900">
                        {((selectedContract.revenue / selectedContract.value) * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <FileCheck className="w-4 h-4" />
                    Documents attachés
                  </h3>
                  <div className="space-y-2">
                    {selectedContract.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{doc}</span>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
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
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50 flex gap-3">
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Modifier
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                <Download className="w-4 h-4 inline mr-2" />
                Télécharger PDF
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

      {/* Create Contract Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Nouvelle Convention</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'entreprise
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: TechCorp Solutions"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro de contrat
                  </label>
                  <input
                    type="text"
                    placeholder="CONV-2024-XXX"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de convention
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900">
                    <option value="formation">Formation</option>
                    <option value="recrutement">Recrutement</option>
                    <option value="partenariat">Partenariat</option>
                    <option value="sponsoring">Sponsoring</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valeur (TND)
                  </label>
                  <input
                    type="number"
                    placeholder="50000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date début
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date fin
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remise (%)
                  </label>
                  <input
                    type="number"
                    placeholder="20"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  placeholder="Notes additionnelles..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Créer la convention
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
