"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import {
  FileText,
  Handshake,
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
  Globe,
  Star,
  Target,
  Package
} from "lucide-react";

interface PartnerContract {
  id: string;
  partnerName: string;
  partnerType: "technology" | "insurance" | "finance" | "education" | "service";
  contractNumber: string;
  status: "active" | "expired" | "pending" | "negotiation";
  signedDate: string;
  startDate: string;
  endDate: string;
  value: number;
  commission: number;
  servicesProvided: string[];
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  website: string;
  performanceMetrics: {
    referrals: number;
    conversions: number;
    revenue: number;
  };
  rating: number;
  notes: string;
}

export default function ContratPartenaire() {
  const { isSuperAdmin, adminProfile, autoEcole } = useAuth();

  const [contracts, setContracts] = useState<PartnerContract[]>([
    {
      id: "1",
      partnerName: "AssurPlus Tunisie",
      partnerType: "insurance",
      contractNumber: "PART-2024-001",
      status: "active",
      signedDate: "2024-01-10",
      startDate: "2024-02-01",
      endDate: "2025-01-31",
      value: 85000,
      commission: 15,
      servicesProvided: ["Assurance auto", "Assurance conduite", "Assistance 24/7"],
      contact: {
        name: "Nadia Hamdi",
        email: "n.hamdi@assurplus.tn",
        phone: "+216 71 234 111"
      },
      website: "www.assurplus.tn",
      performanceMetrics: {
        referrals: 245,
        conversions: 180,
        revenue: 72000
      },
      rating: 4.8,
      notes: "Partenaire stratégique pour assurances"
    },
    {
      id: "2",
      partnerName: "CodeTech Academy",
      partnerType: "technology",
      contractNumber: "PART-2024-002",
      status: "active",
      signedDate: "2023-11-20",
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      value: 45000,
      commission: 20,
      servicesProvided: ["Plateforme e-learning", "Application mobile", "Support technique"],
      contact: {
        name: "Karim Bouzid",
        email: "k.bouzid@codetech.tn",
        phone: "+216 71 345 222"
      },
      website: "www.codetech.tn",
      performanceMetrics: {
        referrals: 0,
        conversions: 0,
        revenue: 45000
      },
      rating: 4.5,
      notes: "Fournisseur de solutions technologiques"
    },
    {
      id: "3",
      partnerName: "BankCar Services",
      partnerType: "finance",
      contractNumber: "PART-2024-003",
      status: "active",
      signedDate: "2024-02-15",
      startDate: "2024-03-01",
      endDate: "2025-02-28",
      value: 120000,
      commission: 12,
      servicesProvided: ["Financement véhicules", "Crédit formation", "Leasing"],
      contact: {
        name: "Sami Gharbi",
        email: "s.gharbi@bankcar.tn",
        phone: "+216 71 456 333"
      },
      website: "www.bankcar.tn",
      performanceMetrics: {
        referrals: 156,
        conversions: 98,
        revenue: 105000
      },
      rating: 4.7,
      notes: "Solutions de financement pour candidats"
    },
    {
      id: "4",
      partnerName: "DriveExam Pro",
      partnerType: "education",
      contractNumber: "PART-2023-045",
      status: "expired",
      signedDate: "2023-01-05",
      startDate: "2023-02-01",
      endDate: "2024-01-31",
      value: 35000,
      commission: 25,
      servicesProvided: ["Tests code en ligne", "Simulateurs conduite", "Formation continue"],
      contact: {
        name: "Leila Mansouri",
        email: "l.mansouri@driveexam.tn",
        phone: "+216 71 567 444"
      },
      website: "www.driveexam.tn",
      performanceMetrics: {
        referrals: 0,
        conversions: 0,
        revenue: 35000
      },
      rating: 4.2,
      notes: "Contrat expiré - À renouveler"
    },
    {
      id: "5",
      partnerName: "AutoMaintenance Express",
      partnerType: "service",
      contractNumber: "PART-2024-004",
      status: "pending",
      signedDate: "2024-06-01",
      startDate: "2024-07-01",
      endDate: "2025-06-30",
      value: 28000,
      commission: 10,
      servicesProvided: ["Entretien véhicules", "Réparations urgentes", "Contrôle technique"],
      contact: {
        name: "Youssef Cherif",
        email: "y.cherif@automaintenance.tn",
        phone: "+216 71 678 555"
      },
      website: "www.automaintenance.tn",
      performanceMetrics: {
        referrals: 0,
        conversions: 0,
        revenue: 0
      },
      rating: 0,
      notes: "En attente d'activation"
    },
    {
      id: "6",
      partnerName: "SafeDrive Insurance",
      partnerType: "insurance",
      contractNumber: "PART-2024-005",
      status: "negotiation",
      signedDate: "",
      startDate: "2024-08-01",
      endDate: "2025-07-31",
      value: 95000,
      commission: 18,
      servicesProvided: ["Assurance tous risques", "Protection juridique", "Assistance internationale"],
      contact: {
        name: "Rania Zouari",
        email: "r.zouari@safedrive.tn",
        phone: "+216 71 789 666"
      },
      website: "www.safedrive.tn",
      performanceMetrics: {
        referrals: 0,
        conversions: 0,
        revenue: 0
      },
      rating: 0,
      notes: "Négociation en cours"
    }
  ]);

  const [selectedContract, setSelectedContract] = useState<PartnerContract | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.partnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || contract.partnerType === filterType;
    const matchesStatus = filterStatus === "all" || contract.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: contracts.length,
    active: contracts.filter(c => c.status === "active").length,
    pending: contracts.filter(c => c.status === "pending").length,
    totalValue: contracts.filter(c => c.status === "active").reduce((sum, c) => sum + c.value, 0),
    totalRevenue: contracts.reduce((sum, c) => sum + c.performanceMetrics.revenue, 0),
    totalReferrals: contracts.reduce((sum, c) => sum + c.performanceMetrics.referrals, 0)
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-700 border-green-200";
      case "expired": return "bg-red-100 text-red-700 border-red-200";
      case "pending": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "negotiation": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle2 className="w-3 h-3" />;
      case "expired": return <XCircle className="w-3 h-3" />;
      case "pending": return <Clock className="w-3 h-3" />;
      case "negotiation": return <AlertTriangle className="w-3 h-3" />;
      default: return <FileText className="w-3 h-3" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const badges = {
      technology: "bg-blue-100 text-blue-700 border-blue-200",
      insurance: "bg-purple-100 text-purple-700 border-purple-200",
      finance: "bg-green-100 text-green-700 border-green-200",
      education: "bg-orange-100 text-orange-700 border-orange-200",
      service: "bg-pink-100 text-pink-700 border-pink-200"
    };
    return badges[type as keyof typeof badges] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contrats Partenaires</h1>
          <p className="text-gray-600 mt-1">
            Gestion des contrats avec les partenaires commerciaux
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouveau Partenaire
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Partenaires Total</p>
            <Handshake className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500 mt-1">
            {stats.active} actifs • {stats.pending} en attente
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Valeur Contrats</p>
            <DollarSign className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">
            {stats.totalValue.toLocaleString()} TND
          </p>
          <p className="text-xs text-gray-500 mt-1">Partenaires actifs</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Revenu Généré</p>
            <TrendingUp className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {stats.totalRevenue.toLocaleString()} TND
          </p>
          <p className="text-xs text-gray-500 mt-1">Tous partenaires</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Recommandations</p>
            <Target className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalReferrals}</p>
          <p className="text-xs text-gray-500 mt-1">Total références</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un partenaire..."
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
            <option value="technology">Technologie</option>
            <option value="insurance">Assurance</option>
            <option value="finance">Finance</option>
            <option value="education">Éducation</option>
            <option value="service">Service</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="pending">En attente</option>
            <option value="negotiation">Négociation</option>
            <option value="expired">Expiré</option>
          </select>
        </div>
      </div>

      {/* Partners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContracts.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            Aucun partenaire trouvé
          </div>
        ) : (
          filteredContracts.map((contract) => (
            <div key={contract.id} className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-lg transition-shadow">
              {/* Partner Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">{contract.partnerName}</h3>
                  <p className="text-xs text-gray-500 font-mono">{contract.contractNumber}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Handshake className="w-6 h-6 text-blue-600" />
                </div>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-2 mb-4">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getTypeBadge(contract.partnerType)}`}>
                  {contract.partnerType.charAt(0).toUpperCase() + contract.partnerType.slice(1)}
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(contract.status)}`}>
                  {getStatusIcon(contract.status)}
                  {contract.status === "active" ? "Actif" :
                   contract.status === "expired" ? "Expiré" :
                   contract.status === "pending" ? "En attente" : "Négociation"}
                </span>
              </div>

              {/* Services */}
              <div className="mb-4">
                <p className="text-xs text-gray-600 mb-2 font-medium">Services fournis:</p>
                <div className="space-y-1">
                  {contract.servicesProvided.slice(0, 2).map((service, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Package className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-700">{service}</span>
                    </div>
                  ))}
                  {contract.servicesProvided.length > 2 && (
                    <p className="text-xs text-gray-500 ml-5">+{contract.servicesProvided.length - 2} autres</p>
                  )}
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 mb-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-500">Valeur</p>
                  <p className="text-sm font-bold text-gray-900">{(contract.value / 1000).toFixed(0)}K TND</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Référ.</p>
                  <p className="text-sm font-bold text-gray-900">{contract.performanceMetrics.referrals}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Conv.</p>
                  <p className="text-sm font-bold text-gray-900">{contract.performanceMetrics.conversions}</p>
                </div>
              </div>

              {/* Rating */}
              {contract.rating > 0 && (
                <div className="flex items-center gap-1 mb-4">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-medium text-gray-900">{contract.rating}</span>
                  <span className="text-xs text-gray-500">/5</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedContract(contract);
                    setShowDetailsModal(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span className="text-sm font-medium">Détails</span>
                </button>
                <button className="p-2 text-gray-600 hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedContract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-linear-to-r from-blue-500 to-purple-500 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-lg bg-white/20 flex items-center justify-center">
                    <Handshake className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{selectedContract.partnerName}</h2>
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

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="space-y-6">
                {/* Contract Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Type de partenaire</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getTypeBadge(selectedContract.partnerType)}`}>
                      {selectedContract.partnerType.toUpperCase()}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Statut</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(selectedContract.status)}`}>
                      {getStatusIcon(selectedContract.status)}
                      {selectedContract.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Commission</p>
                    <p className="text-lg font-bold text-gray-900">{selectedContract.commission}%</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Notation</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <span className="text-lg font-bold text-gray-900">
                        {selectedContract.rating > 0 ? selectedContract.rating : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-bold text-blue-900 mb-3">Contact & Coordonnées</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-xs text-blue-700">Contact</p>
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
                      <Globe className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-xs text-blue-700">Site web</p>
                        <p className="text-sm font-medium text-blue-900">{selectedContract.website}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Services */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="text-sm font-bold text-purple-900 mb-3">Services Fournis</h3>
                  <div className="space-y-2">
                    {selectedContract.servicesProvided.map((service, index) => (
                      <div key={index} className="flex items-center gap-2 bg-white p-2 rounded border border-purple-200">
                        <Package className="w-4 h-4 text-purple-600" />
                        <span className="text-sm text-purple-900">{service}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Performance Metrics */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-3">Métriques de Performance</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-green-600" />
                        <p className="text-xs text-green-700 font-medium">Références</p>
                      </div>
                      <p className="text-2xl font-bold text-green-900">{selectedContract.performanceMetrics.referrals}</p>
                    </div>

                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-orange-600" />
                        <p className="text-xs text-orange-700 font-medium">Conversions</p>
                      </div>
                      <p className="text-2xl font-bold text-orange-900">{selectedContract.performanceMetrics.conversions}</p>
                      {selectedContract.performanceMetrics.referrals > 0 && (
                        <p className="text-xs text-orange-700 mt-1">
                          {((selectedContract.performanceMetrics.conversions / selectedContract.performanceMetrics.referrals) * 100).toFixed(1)}% taux
                        </p>
                      )}
                    </div>

                    <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-pink-600" />
                        <p className="text-xs text-pink-700 font-medium">Revenu</p>
                      </div>
                      <p className="text-2xl font-bold text-pink-900">
                        {selectedContract.performanceMetrics.revenue.toLocaleString()} TND
                      </p>
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
