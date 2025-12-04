"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Building2, 
  Users, 
  TrendingUp, 
  DollarSign, 
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  Globe,
  UserPlus,
  Search,
  Filter,
  Download,
  FileText,
  BarChart3,
  Target,
  Award,
  Briefcase,
  Calendar,
  Plus,
  Edit,
  Trash2,
  Eye,
  Send,
  Star,
  TrendingDown,
  AlertCircle,
  X
} from "lucide-react";

interface Partner {
  id: string;
  name: string;
  logo?: string;
  industry: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  website?: string;
  status: "active" | "pending" | "inactive";
  contractStart?: Date;
  contractEnd?: Date;
  discountType: "percentage" | "fixed";
  discountValue: number;
  employeeCount?: number;
  registrationsCount: number;
  revenue: number;
  lastActivity?: Date;
}

export default function EntreprisesConventionneesMarketingPage() {
  const { isSuperAdmin, adminProfile, autoEcole } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterIndustry, setFilterIndustry] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  // Mock data - replace with Firestore data
  const partners: Partner[] = [
    {
      id: "1",
      name: "Tech Solutions SARL",
      logo: "https://via.placeholder.com/100",
      industry: "Technologie",
      contactPerson: "Ahmed Ben Ali",
      email: "ahmed@techsolutions.tn",
      phone: "+216 70 123 456",
      address: "Avenue Habib Bourguiba",
      city: "Tunis",
      website: "www.techsolutions.tn",
      status: "active",
      contractStart: new Date("2024-01-15"),
      contractEnd: new Date("2025-01-15"),
      discountType: "percentage",
      discountValue: 20,
      employeeCount: 150,
      registrationsCount: 45,
      revenue: 135000,
      lastActivity: new Date("2024-12-01")
    },
    {
      id: "2",
      name: "Banque Nationale",
      industry: "Finance",
      contactPerson: "Fatma Trabelsi",
      email: "f.trabelsi@banque.tn",
      phone: "+216 71 234 567",
      address: "Boulevard du 7 Novembre",
      city: "Sfax",
      status: "active",
      contractStart: new Date("2024-03-01"),
      contractEnd: new Date("2025-03-01"),
      discountType: "fixed",
      discountValue: 500,
      employeeCount: 300,
      registrationsCount: 82,
      revenue: 246000,
      lastActivity: new Date("2024-11-28")
    },
    {
      id: "3",
      name: "Hôtel Royal Palace",
      industry: "Hôtellerie",
      contactPerson: "Karim Mansour",
      email: "k.mansour@royalpalace.tn",
      phone: "+216 73 345 678",
      address: "Zone Touristique",
      city: "Sousse",
      website: "www.royalpalace.tn",
      status: "pending",
      contractStart: new Date("2024-06-01"),
      discountType: "percentage",
      discountValue: 15,
      employeeCount: 200,
      registrationsCount: 12,
      revenue: 36000,
      lastActivity: new Date("2024-11-20")
    },
    {
      id: "4",
      name: "Manufacture Export",
      industry: "Industrie",
      contactPerson: "Mohamed Jendoubi",
      email: "m.jendoubi@manufexport.tn",
      phone: "+216 72 456 789",
      address: "Zone Industrielle",
      city: "Monastir",
      status: "inactive",
      contractStart: new Date("2023-09-01"),
      contractEnd: new Date("2024-09-01"),
      discountType: "percentage",
      discountValue: 10,
      employeeCount: 500,
      registrationsCount: 28,
      revenue: 84000,
      lastActivity: new Date("2024-09-15")
    }
  ];

  const filteredPartners = partners.filter(partner => {
    const matchesSearch = partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partner.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partner.industry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || partner.status === filterStatus;
    const matchesIndustry = filterIndustry === "all" || partner.industry === filterIndustry;
    return matchesSearch && matchesStatus && matchesIndustry;
  });

  const stats = {
    total: partners.length,
    active: partners.filter(p => p.status === "active").length,
    pending: partners.filter(p => p.status === "pending").length,
    totalRevenue: partners.reduce((sum, p) => sum + p.revenue, 0),
    totalRegistrations: partners.reduce((sum, p) => sum + p.registrationsCount, 0)
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return { bg: "bg-green-50 text-green-700 border-green-200", icon: <CheckCircle2 className="w-3 h-3" />, text: "Actif" };
      case "pending":
        return { bg: "bg-orange-50 text-orange-700 border-orange-200", icon: <Clock className="w-3 h-3" />, text: "En attente" };
      case "inactive":
        return { bg: "bg-red-50 text-red-700 border-red-200", icon: <XCircle className="w-3 h-3" />, text: "Inactif" };
      default:
        return { bg: "bg-gray-50 text-gray-700 border-gray-200", icon: <AlertCircle className="w-3 h-3" />, text: status };
    }
  };

  const industries = ["Technologie", "Finance", "Hôtellerie", "Industrie", "Commerce", "Santé", "Éducation"];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-blue-600" />
            Entreprises Conventionnées
          </h1>
          <p className="text-gray-600 mt-1">
            Gérez vos partenariats d'entreprise et maximisez vos revenus B2B
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouvelle Convention
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Partenaires</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Building2 className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Actifs</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En Attente</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inscriptions</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalRegistrations}</p>
            </div>
            <Users className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Revenu Total</p>
              <p className="text-2xl font-bold text-green-600">{stats.totalRevenue.toLocaleString()} TND</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une entreprise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="pending">En attente</option>
            <option value="inactive">Inactifs</option>
          </select>
          
          <select
            value={filterIndustry}
            onChange={(e) => setFilterIndustry(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les secteurs</option>
            {industries.map(industry => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Partners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPartners.map((partner) => {
          const statusBadge = getStatusBadge(partner.status);
          return (
            <div key={partner.id} className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
              {/* Card Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {partner.logo ? (
                      <img src={partner.logo} alt={partner.name} className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-blue-600" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-gray-900">{partner.name}</h3>
                      <p className="text-xs text-gray-500">{partner.industry}</p>
                    </div>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusBadge.bg}`}>
                  {statusBadge.icon} {statusBadge.text}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {partner.city}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {partner.email}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {partner.phone}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                  <div className="bg-blue-50 rounded-lg p-2">
                    <p className="text-xs text-blue-600 font-medium">Employés</p>
                    <p className="text-lg font-bold text-blue-900">{partner.employeeCount || 0}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2">
                    <p className="text-xs text-green-600 font-medium">Inscriptions</p>
                    <p className="text-lg font-bold text-green-900">{partner.registrationsCount}</p>
                  </div>
                </div>

                {/* Discount Badge */}
                <div className="flex items-center justify-between bg-orange-50 rounded-lg p-2 border border-orange-200">
                  <span className="text-xs text-orange-700 font-medium">Réduction</span>
                  <span className="text-sm font-bold text-orange-900">
                    {partner.discountType === "percentage" 
                      ? `${partner.discountValue}%` 
                      : `${partner.discountValue} TND`}
                  </span>
                </div>

                {/* Revenue */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Revenu généré</span>
                  <span className="text-sm font-bold text-green-600">{partner.revenue.toLocaleString()} TND</span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 border-t border-gray-200 flex gap-2">
                <button
                  onClick={() => {
                    setSelectedPartner(partner);
                    setShowDetailsModal(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors text-sm font-medium"
                >
                  <Eye className="w-4 h-4" />
                  Détails
                </button>
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPartners.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">Aucune entreprise trouvée</p>
          <p className="text-gray-400 text-sm mt-2">Essayez de modifier vos filtres de recherche</p>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedPartner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-linear-to-r from-blue-500 to-purple-500 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {selectedPartner.logo ? (
                    <img src={selectedPartner.logo} alt={selectedPartner.name} className="w-16 h-16 rounded-lg object-cover border-2 border-white" />
                  ) : (
                    <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-white" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold">{selectedPartner.name}</h2>
                    <p className="text-white/90 text-sm">{selectedPartner.industry} • {selectedPartner.city}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedPartner(null);
                  }}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Contact Information */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-blue-600" />
                  Informations de Contact
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Personne de contact</p>
                    <p className="font-medium text-gray-900">{selectedPartner.contactPerson}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <p className="font-medium text-gray-900">{selectedPartner.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Téléphone</p>
                    <p className="font-medium text-gray-900">{selectedPartner.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Site Web</p>
                    <p className="font-medium text-blue-600">{selectedPartner.website || "N/A"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 mb-1">Adresse</p>
                    <p className="font-medium text-gray-900">{selectedPartner.address}, {selectedPartner.city}</p>
                  </div>
                </div>
              </div>

              {/* Contract Details */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  Détails du Contrat
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Date de début</p>
                    <p className="font-medium text-gray-900">
                      {selectedPartner.contractStart?.toLocaleDateString('fr-FR') || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Date de fin</p>
                    <p className="font-medium text-gray-900">
                      {selectedPartner.contractEnd?.toLocaleDateString('fr-FR') || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Type de réduction</p>
                    <p className="font-medium text-gray-900">
                      {selectedPartner.discountType === "percentage" ? "Pourcentage" : "Montant fixe"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Valeur</p>
                    <p className="font-medium text-orange-600 text-lg">
                      {selectedPartner.discountType === "percentage" 
                        ? `${selectedPartner.discountValue}%` 
                        : `${selectedPartner.discountValue} TND`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-6 h-6 text-blue-600" />
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                  </div>
                  <p className="text-sm text-blue-600 font-medium">Employés</p>
                  <p className="text-2xl font-bold text-blue-900">{selectedPartner.employeeCount || 0}</p>
                </div>

                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <UserPlus className="w-6 h-6 text-green-600" />
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-sm text-green-600 font-medium">Inscriptions</p>
                  <p className="text-2xl font-bold text-green-900">{selectedPartner.registrationsCount}</p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                    <TrendingUp className="w-4 h-4 text-purple-500" />
                  </div>
                  <p className="text-sm text-purple-600 font-medium">Revenu</p>
                  <p className="text-xl font-bold text-purple-900">{selectedPartner.revenue.toLocaleString()} TND</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  <Send className="w-5 h-5" />
                  Envoyer Email
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  <Download className="w-5 h-5" />
                  Rapport PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
