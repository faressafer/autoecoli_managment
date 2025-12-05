"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  getTreasuryTransactions, 
  addTreasuryTransaction, 
  updateTreasuryTransaction,
  deleteTreasuryTransaction 
} from "@/lib/firebase/services/treasury";
import {
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  X,
  Check,
  AlertCircle,
  RefreshCw,
  Download,
  Calendar,
} from "lucide-react";

interface Transaction {
  id: string;
  type: "entree" | "sortie";
  montant: number;
  description: string;
  categorie: string;
  methodePayement: string;
  reference: string;
  date: Date;
  creePar: string;
  statut: "valide" | "en_attente" | "annule";
  createdAt: Date;
  updatedAt: Date;
}

export default function CaissePage() {
  const { user, isSuperAdmin } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"tous" | "entree" | "sortie">("tous");
  const [filterDate, setFilterDate] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Formulaire pour nouvelle transaction
  const [newTransaction, setNewTransaction] = useState({
    type: "entree" as "entree" | "sortie",
    montant: "",
    description: "",
    categorie: "",
    methodePayement: "Espèces",
    reference: "",
  });

  const categories = [
    "Inscription",
    "Formation",
    "Examen",
    "Fournitures",
    "Salaires",
    "Carburant",
    "Entretien véhicule",
    "Loyer",
    "Électricité",
    "Internet",
    "Assurance",
    "Autre",
  ];

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await getTreasuryTransactions();
      setTransactions(data);
    } catch (error) {
      console.error("Error loading transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculs
  const totalEntrees = transactions
    .filter((t) => t.type === "entree" && t.statut === "valide")
    .reduce((sum, t) => sum + t.montant, 0);

  const totalSorties = transactions
    .filter((t) => t.type === "sortie" && t.statut === "valide")
    .reduce((sum, t) => sum + t.montant, 0);

  const solde = totalEntrees - totalSorties;

  // Filtrage
  const filteredTransactions = transactions.filter((transaction) => {
    const matchSearch =
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === "tous" || transaction.type === filterType;
    const matchDate = !filterDate || transaction.date.toISOString().startsWith(filterDate);

    return matchSearch && matchType && matchDate;
  });

  const handleAddTransaction = async () => {
    if (!newTransaction.montant || !newTransaction.description || !newTransaction.categorie) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      setActionLoading("add");
      
      const transactionData = {
        type: newTransaction.type,
        montant: parseFloat(newTransaction.montant),
        description: newTransaction.description,
        categorie: newTransaction.categorie,
        methodePayement: newTransaction.methodePayement,
        reference: newTransaction.reference || `REF-${Date.now()}`,
        date: new Date(),
        creePar: user?.email || "Admin",
        statut: "valide" as const,
      };

      await addTreasuryTransaction(transactionData);
      await loadTransactions();
      
      setShowAddModal(false);
      setNewTransaction({
        type: "entree",
        montant: "",
        description: "",
        categorie: "",
        methodePayement: "Espèces",
        reference: "",
      });
    } catch (error) {
      console.error("Error adding transaction:", error);
      alert("Erreur lors de l'ajout de la transaction");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette transaction ?")) return;

    try {
      setActionLoading(id);
      await deleteTreasuryTransaction(id);
      await loadTransactions();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      alert("Erreur lors de la suppression");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement des transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Wallet className="w-8 h-8 text-blue-600" />
              Gestion de la Caisse
            </h1>
            <p className="text-gray-600 mt-2">
              Gérez vos entrées et sorties financières
            </p>
          </div>
          <button
            onClick={loadTransactions}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Actualiser
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Solde actuel */}
        <div className="bg-linear-to-br from-blue-600 to-blue-700 text-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Wallet className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
              Solde
            </span>
          </div>
          <div>
            <p className="text-3xl font-bold">{solde.toFixed(2)} TND</p>
            <p className="text-white/80 text-sm mt-1">Solde actuel de la caisse</p>
          </div>
        </div>

        {/* Total Entrées */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <ArrowUpCircle className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
              Entrées
            </span>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">
              {totalEntrees.toFixed(2)} TND
            </p>
            <p className="text-gray-600 text-sm mt-1">
              Total des entrées validées
            </p>
          </div>
        </div>

        {/* Total Sorties */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-50 rounded-lg">
              <ArrowDownCircle className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-sm font-medium text-red-600 bg-red-50 px-3 py-1 rounded-full">
              Sorties
            </span>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">
              {totalSorties.toFixed(2)} TND
            </p>
            <p className="text-gray-600 text-sm mt-1">
              Total des sorties validées
            </p>
          </div>
        </div>
      </div>

      {/* Filtres et Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Barre de recherche */}
          <div className="flex-1 w-full lg:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une transaction..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtres */}
          <div className="flex flex-wrap gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
            >
              <option value="tous">Tous les types</option>
              <option value="entree">Entrées</option>
              <option value="sortie">Sorties</option>
            </select>

            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Nouvelle transaction
            </button>
          </div>
        </div>
      </div>

      {/* Liste des transactions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Méthode
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <AlertCircle className="w-12 h-12 text-gray-400" />
                      <p className="text-gray-500">Aucune transaction trouvée</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {transaction.type === "entree" ? (
                          <div className="p-2 bg-green-50 rounded-lg">
                            <ArrowUpCircle className="w-5 h-5 text-green-600" />
                          </div>
                        ) : (
                          <div className="p-2 bg-red-50 rounded-lg">
                            <ArrowDownCircle className="w-5 h-5 text-red-600" />
                          </div>
                        )}
                        <span className={`font-medium ${transaction.type === "entree" ? "text-green-600" : "text-red-600"
                          }`}>
                          {transaction.type === "entree" ? "Entrée" : "Sortie"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {transaction.description}
                        </p>
                        <p className="text-sm text-gray-500">
                          Réf: {transaction.reference}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                        {transaction.categorie}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {transaction.methodePayement}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-bold text-lg ${transaction.type === "entree" ? "text-green-600" : "text-red-600"
                        }`}>
                        {transaction.type === "entree" ? "+" : "-"}
                        {transaction.montant.toFixed(2)} TND
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {transaction.date.toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedTransaction(transaction);
                            setShowDetailsModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Voir détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          disabled={actionLoading === transaction.id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Supprimer"
                        >
                          {actionLoading === transaction.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
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

      {/* Modal Ajouter Transaction */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-black">
                Nouvelle Transaction
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Type de transaction *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() =>
                      setNewTransaction({ ...newTransaction, type: "entree" })
                    }
                    className={`p-4 border-2 rounded-lg flex items-center justify-center gap-2 transition-all ${newTransaction.type === "entree"
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-300 hover:border-green-300"
                      }`}
                  >
                    <ArrowUpCircle className="w-5 h-5" />
                    <span className="font-medium">Entrée</span>
                  </button>
                  <button
                    onClick={() =>
                      setNewTransaction({ ...newTransaction, type: "sortie" })
                    }
                    className={`p-4 border-2 rounded-lg flex items-center justify-center gap-2 transition-all ${newTransaction.type === "sortie"
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-gray-300 hover:border-red-300"
                      }`}
                  >
                    <ArrowDownCircle className="w-5 h-5" />
                    <span className="font-medium">Sortie</span>
                  </button>
                </div>
              </div>

              {/* Montant */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Montant (TND) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newTransaction.montant}
                  onChange={(e) =>
                    setNewTransaction({ ...newTransaction, montant: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="0.00"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Description *
                </label>
                <textarea
                  value={newTransaction.description}
                  onChange={(e) =>
                    setNewTransaction({ ...newTransaction, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  rows={3}
                  placeholder="Description de la transaction..."
                />
              </div>

              {/* Catégorie */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Catégorie *
                </label>
                <select
                  value={newTransaction.categorie}
                  onChange={(e) =>
                    setNewTransaction({ ...newTransaction, categorie: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Méthode de paiement */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Méthode de paiement
                </label>
                <select
                  value={newTransaction.methodePayement}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      methodePayement: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                >
                  <option value="Espèces">Espèces</option>
                  <option value="Carte bancaire">Carte bancaire</option>
                  <option value="Virement">Virement</option>
                  <option value="Chèque">Chèque</option>
                </select>
              </div>

              {/* Référence */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Référence (optionnel)
                </label>
                <input
                  type="text"
                  value={newTransaction.reference}
                  onChange={(e) =>
                    setNewTransaction({ ...newTransaction, reference: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="REF-2024-XXX"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleAddTransaction}
                disabled={actionLoading === "add"}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {actionLoading === "add" ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  "Enregistrer"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Détails Transaction */}
      {showDetailsModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="bg-linear-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between rounded-t-lg">
              <h3 className="text-xl font-bold">Détails de la transaction</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                {selectedTransaction.type === "entree" ? (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <ArrowUpCircle className="w-6 h-6 text-green-600" />
                  </div>
                ) : (
                  <div className="p-3 bg-red-50 rounded-lg">
                    <ArrowDownCircle className="w-6 h-6 text-red-600" />
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">
                    {selectedTransaction.type === "entree" ? "Entrée" : "Sortie"}
                  </p>
                  <p className={`text-2xl font-bold ${selectedTransaction.type === "entree" ? "text-green-600" : "text-red-600"
                    }`}>
                    {selectedTransaction.type === "entree" ? "+" : "-"}
                    {selectedTransaction.montant.toFixed(2)} TND
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="font-medium text-gray-900">
                    {selectedTransaction.description}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Catégorie</p>
                  <span className="inline-block mt-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                    {selectedTransaction.categorie}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Méthode de paiement</p>
                  <p className="font-medium text-gray-900">
                    {selectedTransaction.methodePayement}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Référence</p>
                  <p className="font-medium text-gray-900">
                    {selectedTransaction.reference}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-medium text-gray-900">
                    {selectedTransaction.date.toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Créé par</p>
                  <p className="font-medium text-gray-900">
                    {selectedTransaction.creePar}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Statut</p>
                  <span className="inline-flex items-center gap-1 mt-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                    <Check className="w-4 h-4" />
                    {selectedTransaction.statut === "valide" && "Validé"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border-t border-gray-200 px-6 py-4 rounded-b-lg">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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

