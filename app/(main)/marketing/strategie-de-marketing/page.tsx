"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { 
  TrendingUp, 
  Target, 
  DollarSign, 
  Users, 
  Mail, 
  MessageSquare, 
  Globe, 
  Share2,
  BarChart3,
  Calendar,
  Eye,
  MousePointer,
  ShoppingCart,
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  X,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Play,
  Pause,
  TrendingDown,
  ArrowUp,
  ArrowDown
} from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  type: "email" | "social" | "seo" | "ppc" | "content" | "sms";
  status: "active" | "paused" | "completed" | "draft" | "scheduled";
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  reach: number;
  impressions: number;
  clicks: number;
  conversions: number;
  roi: number;
  ctr: number;
  cpc: number;
  targetAudience: string;
  description: string;
}

interface MarketingMetrics {
  totalBudget: number;
  spent: number;
  roi: number;
  totalReach: number;
  totalConversions: number;
  avgCTR: number;
  activeCampaigns: number;
}

export default function StrategieDeMarketingPage() {
  const { isSuperAdmin, adminProfile, autoEcole } = useAuth();
  
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: "1",
      name: "Campagne d'été 2024 - Permis Accéléré",
      type: "social",
      status: "active",
      budget: 5000,
      spent: 3200,
      startDate: "2024-06-01",
      endDate: "2024-08-31",
      reach: 45000,
      impressions: 120000,
      clicks: 3600,
      conversions: 180,
      roi: 340,
      ctr: 3.0,
      cpc: 0.89,
      targetAudience: "18-25 ans, étudiants",
      description: "Promotion permis accéléré avec réduction de 20% pour les étudiants"
    },
    {
      id: "2",
      name: "SEO Local - Auto-écoles Tunis",
      type: "seo",
      status: "active",
      budget: 2000,
      spent: 1800,
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      reach: 15000,
      impressions: 85000,
      clicks: 2550,
      conversions: 95,
      roi: 285,
      ctr: 3.0,
      cpc: 0.71,
      targetAudience: "Tous âges, Tunis et banlieue",
      description: "Optimisation SEO pour recherches locales et Google My Business"
    },
    {
      id: "3",
      name: "Email Marketing - Offres spéciales",
      type: "email",
      status: "completed",
      budget: 800,
      spent: 750,
      startDate: "2024-03-01",
      endDate: "2024-03-31",
      reach: 8000,
      impressions: 8000,
      clicks: 1200,
      conversions: 65,
      roi: 420,
      ctr: 15.0,
      cpc: 0.63,
      targetAudience: "Base de données clients existants",
      description: "Newsletter mensuelle avec offres exclusives et promotions"
    },
    {
      id: "4",
      name: "Google Ads - Permis B",
      type: "ppc",
      status: "active",
      budget: 3500,
      spent: 2100,
      startDate: "2024-05-01",
      endDate: "2024-07-31",
      reach: 25000,
      impressions: 95000,
      clicks: 2850,
      conversions: 142,
      roi: 310,
      ctr: 3.0,
      cpc: 0.74,
      targetAudience: "18-35 ans, recherche active permis",
      description: "Campagne Google Ads ciblée sur les mots-clés permis de conduire"
    },
    {
      id: "5",
      name: "Réseaux Sociaux - Témoignages",
      type: "content",
      status: "paused",
      budget: 1200,
      spent: 600,
      startDate: "2024-04-01",
      endDate: "2024-06-30",
      reach: 12000,
      impressions: 35000,
      clicks: 980,
      conversions: 28,
      roi: 145,
      ctr: 2.8,
      cpc: 0.61,
      targetAudience: "Tous âges, followers existants",
      description: "Partage de témoignages vidéo de candidats réussis"
    },
    {
      id: "6",
      name: "SMS Marketing - Rappels",
      type: "sms",
      status: "scheduled",
      budget: 500,
      spent: 0,
      startDate: "2024-09-01",
      endDate: "2024-09-30",
      reach: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      roi: 0,
      ctr: 0,
      cpc: 0,
      targetAudience: "Candidats inscrits",
      description: "Rappels automatiques pour examens et rendez-vous"
    }
  ]);

  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Calculate metrics
  const metrics: MarketingMetrics = {
    totalBudget: campaigns.reduce((sum, c) => sum + c.budget, 0),
    spent: campaigns.reduce((sum, c) => sum + c.spent, 0),
    roi: campaigns.length > 0 ? campaigns.reduce((sum, c) => sum + c.roi, 0) / campaigns.length : 0,
    totalReach: campaigns.reduce((sum, c) => sum + c.reach, 0),
    totalConversions: campaigns.reduce((sum, c) => sum + c.conversions, 0),
    avgCTR: campaigns.length > 0 ? campaigns.reduce((sum, c) => sum + c.ctr, 0) / campaigns.length : 0,
    activeCampaigns: campaigns.filter(c => c.status === "active").length
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || campaign.type === filterType;
    const matchesStatus = filterStatus === "all" || campaign.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getCampaignTypeIcon = (type: string) => {
    switch (type) {
      case "email": return <Mail className="w-4 h-4" />;
      case "social": return <Share2 className="w-4 h-4" />;
      case "seo": return <Globe className="w-4 h-4" />;
      case "ppc": return <MousePointer className="w-4 h-4" />;
      case "content": return <MessageSquare className="w-4 h-4" />;
      case "sms": return <MessageSquare className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getCampaignTypeBadge = (type: string) => {
    const badges = {
      email: "bg-blue-100 text-blue-700 border-blue-200",
      social: "bg-purple-100 text-purple-700 border-purple-200",
      seo: "bg-green-100 text-green-700 border-green-200",
      ppc: "bg-orange-100 text-orange-700 border-orange-200",
      content: "bg-pink-100 text-pink-700 border-pink-200",
      sms: "bg-indigo-100 text-indigo-700 border-indigo-200"
    };
    return badges[type as keyof typeof badges] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700 border-green-200";
      case "paused":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "completed":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "draft":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "scheduled":
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <Play className="w-3 h-3" />;
      case "paused": return <Pause className="w-3 h-3" />;
      case "completed": return <CheckCircle2 className="w-3 h-3" />;
      case "draft": return <Edit className="w-3 h-3" />;
      case "scheduled": return <Clock className="w-3 h-3" />;
      default: return <AlertCircle className="w-3 h-3" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stratégie de Marketing</h1>
          <p className="text-gray-600 mt-1">
            Gérez vos campagnes marketing et analysez leurs performances
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouvelle Campagne
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Budget Total</p>
            <DollarSign className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{metrics.totalBudget.toLocaleString()} TND</p>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ width: `${(metrics.spent / metrics.totalBudget) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">{Math.round((metrics.spent / metrics.totalBudget) * 100)}%</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Dépensé: {metrics.spent.toLocaleString()} TND
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">ROI Moyen</p>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">{metrics.roi.toFixed(0)}%</p>
          <div className="mt-2 flex items-center gap-1">
            <ArrowUp className="w-3 h-3 text-green-600" />
            <span className="text-xs text-green-600">+15% vs mois dernier</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Portée Totale</p>
            <Users className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{(metrics.totalReach / 1000).toFixed(1)}K</p>
          <p className="text-xs text-gray-500 mt-2">
            {metrics.totalConversions} conversions
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Campagnes Actives</p>
            <Target className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{metrics.activeCampaigns}</p>
          <p className="text-xs text-gray-500 mt-2">
            sur {campaigns.length} total
          </p>
        </div>
      </div>

      {/* Performance Chart Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Performance des Campagnes
          </h2>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            Exporter
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-blue-900">Taux de Clics (CTR)</p>
              <MousePointer className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-blue-900">{metrics.avgCTR.toFixed(1)}%</p>
            <p className="text-xs text-blue-700 mt-2">Moyenne toutes campagnes</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-green-900">Conversions</p>
              <ShoppingCart className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-900">{metrics.totalConversions}</p>
            <p className="text-xs text-green-700 mt-2">
              Taux: {((metrics.totalConversions / campaigns.reduce((sum, c) => sum + c.clicks, 0)) * 100).toFixed(1)}%
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-purple-900">Impressions Totales</p>
              <Eye className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-purple-900">
              {(campaigns.reduce((sum, c) => sum + c.impressions, 0) / 1000).toFixed(0)}K
            </p>
            <p className="text-xs text-purple-700 mt-2">
              Tous canaux confondus
            </p>
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
              placeholder="Rechercher une campagne..."
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
            <option value="email">Email Marketing</option>
            <option value="social">Réseaux Sociaux</option>
            <option value="seo">SEO</option>
            <option value="ppc">Google Ads (PPC)</option>
            <option value="content">Contenu</option>
            <option value="sms">SMS</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Active</option>
            <option value="paused">En pause</option>
            <option value="completed">Terminée</option>
            <option value="draft">Brouillon</option>
            <option value="scheduled">Planifiée</option>
          </select>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Campagne
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Budget
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ROI
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Aucune campagne trouvée
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{campaign.name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(campaign.startDate).toLocaleDateString('fr-FR')} - {new Date(campaign.endDate).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getCampaignTypeBadge(campaign.type)}`}>
                        {getCampaignTypeIcon(campaign.type)}
                        {campaign.type.toUpperCase()}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(campaign.status)}`}>
                        {getStatusIcon(campaign.status)}
                        {campaign.status === "active" ? "Active" : 
                         campaign.status === "paused" ? "En pause" :
                         campaign.status === "completed" ? "Terminée" :
                         campaign.status === "draft" ? "Brouillon" : "Planifiée"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {campaign.budget.toLocaleString()} TND
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-gray-200 rounded-full h-1.5 max-w-20">
                            <div 
                              className="bg-blue-500 h-1.5 rounded-full" 
                              style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {Math.round((campaign.spent / campaign.budget) * 100)}%
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Eye className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-600">{campaign.impressions.toLocaleString()} vues</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MousePointer className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-600">{campaign.clicks.toLocaleString()} clics (CTR: {campaign.ctr}%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-600">{campaign.conversions} conversions</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {campaign.roi > 200 ? (
                          <ArrowUp className="w-4 h-4 text-green-600" />
                        ) : campaign.roi > 100 ? (
                          <TrendingUp className="w-4 h-4 text-yellow-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                        <span className={`text-sm font-bold ${
                          campaign.roi > 200 ? 'text-green-600' : 
                          campaign.roi > 100 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {campaign.roi}%
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedCampaign(campaign);
                            setShowDetailsModal(true);
                          }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Voir détails"
                        >
                          <Eye className="w-4 h-4" />
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

      {/* Campaign Details Modal */}
      {showDetailsModal && selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-linear-to-r from-blue-500 to-purple-500 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
                    {getCampaignTypeIcon(selectedCampaign.type)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{selectedCampaign.name}</h2>
                    <p className="text-white/90 text-sm">{selectedCampaign.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedCampaign(null);
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
                {/* Campaign Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Type de campagne</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getCampaignTypeBadge(selectedCampaign.type)}`}>
                      {getCampaignTypeIcon(selectedCampaign.type)}
                      {selectedCampaign.type.toUpperCase()}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Statut</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(selectedCampaign.status)}`}>
                      {getStatusIcon(selectedCampaign.status)}
                      {selectedCampaign.status === "active" ? "Active" : 
                       selectedCampaign.status === "paused" ? "En pause" :
                       selectedCampaign.status === "completed" ? "Terminée" : "Brouillon"}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Période</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(selectedCampaign.startDate).toLocaleDateString('fr-FR')} - {new Date(selectedCampaign.endDate).toLocaleDateString('fr-FR')}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Audience cible</p>
                    <p className="text-sm font-medium text-gray-900">{selectedCampaign.targetAudience}</p>
                  </div>
                </div>

                {/* Budget Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Budget et Dépenses
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-blue-700 mb-1">Budget Total</p>
                      <p className="text-lg font-bold text-blue-900">{selectedCampaign.budget.toLocaleString()} TND</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-700 mb-1">Dépensé</p>
                      <p className="text-lg font-bold text-blue-900">{selectedCampaign.spent.toLocaleString()} TND</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-700 mb-1">Restant</p>
                      <p className="text-lg font-bold text-blue-900">{(selectedCampaign.budget - selectedCampaign.spent).toLocaleString()} TND</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-blue-700 mb-1">
                      <span>Progression du budget</span>
                      <span>{Math.round((selectedCampaign.spent / selectedCampaign.budget) * 100)}%</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(selectedCampaign.spent / selectedCampaign.budget) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Métriques de Performance
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-purple-600" />
                        <p className="text-xs text-purple-700 font-medium">Portée</p>
                      </div>
                      <p className="text-xl font-bold text-purple-900">{selectedCampaign.reach.toLocaleString()}</p>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Eye className="w-4 h-4 text-green-600" />
                        <p className="text-xs text-green-700 font-medium">Impressions</p>
                      </div>
                      <p className="text-xl font-bold text-green-900">{selectedCampaign.impressions.toLocaleString()}</p>
                    </div>

                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <MousePointer className="w-4 h-4 text-orange-600" />
                        <p className="text-xs text-orange-700 font-medium">Clics</p>
                      </div>
                      <p className="text-xl font-bold text-orange-900">{selectedCampaign.clicks.toLocaleString()}</p>
                      <p className="text-xs text-orange-700 mt-1">CTR: {selectedCampaign.ctr}%</p>
                    </div>

                    <div className="bg-pink-50 border border-pink-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <ShoppingCart className="w-4 h-4 text-pink-600" />
                        <p className="text-xs text-pink-700 font-medium">Conversions</p>
                      </div>
                      <p className="text-xl font-bold text-pink-900">{selectedCampaign.conversions}</p>
                      <p className="text-xs text-pink-700 mt-1">
                        Taux: {((selectedCampaign.conversions / selectedCampaign.clicks) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* ROI Section */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-sm font-bold text-green-900 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Retour sur Investissement (ROI)
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="text-4xl font-bold text-green-900">{selectedCampaign.roi}%</p>
                      <p className="text-sm text-green-700 mt-1">
                        CPC moyen: {selectedCampaign.cpc.toFixed(2)} TND
                      </p>
                    </div>
                    <div className={`px-4 py-2 rounded-lg ${
                      selectedCampaign.roi > 200 ? 'bg-green-100' :
                      selectedCampaign.roi > 100 ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                      {selectedCampaign.roi > 200 ? (
                        <div className="flex items-center gap-2">
                          <ArrowUp className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-bold text-green-700">Excellent</span>
                        </div>
                      ) : selectedCampaign.roi > 100 ? (
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-yellow-600" />
                          <span className="text-sm font-bold text-yellow-700">Bon</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <TrendingDown className="w-5 h-5 text-red-600" />
                          <span className="text-sm font-bold text-red-700">À améliorer</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50 flex gap-3">
              <button
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Modifier la campagne
              </button>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedCampaign(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Nouvelle Campagne Marketing</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la campagne
                </label>
                <input
                  type="text"
                  placeholder="Ex: Campagne d'été 2024"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de campagne
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900">
                    <option value="email">Email Marketing</option>
                    <option value="social">Réseaux Sociaux</option>
                    <option value="seo">SEO</option>
                    <option value="ppc">Google Ads (PPC)</option>
                    <option value="content">Contenu</option>
                    <option value="sms">SMS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget (TND)
                  </label>
                  <input
                    type="number"
                    placeholder="5000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de début
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Audience cible
                </label>
                <input
                  type="text"
                  placeholder="Ex: 18-25 ans, étudiants"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Décrivez les objectifs et le contenu de la campagne..."
                  rows={4}
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
              <button
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Créer la campagne
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
