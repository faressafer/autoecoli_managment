"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Car, DollarSign, Calendar, Plus, UserCog, FileText, CheckCircle2, XCircle, Power, Crown, Star, Circle, Eye, Edit2, AlertCircle } from "lucide-react";
import { db } from "@/lib/firebase/config";
import { collection, getDocs, query, where, doc, updateDoc, Timestamp } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import dynamic from "next/dynamic";

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

export default function DashboardPage() {
  const { error: showError, ToastContainer } = useToast();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [autoEcoles, setAutoEcoles] = useState<any[]>([]);
  const [onboardingSurveys, setOnboardingSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedAutoEcole, setSelectedAutoEcole] = useState<any | null>(null);
  const [showPackModal, setShowPackModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const { userProfile, isSuperAdmin, adminProfile } = useAuth();

  useEffect(() => {
    loadData();
  }, [userProfile, isSuperAdmin]);

  const loadData = async () => {
    try {
      if (!db) {
        console.error("Firebase Firestore n'est pas initialisé");
        return;
      }
      // Super Admin: Load all auto-écoles
      if (isSuperAdmin) {
        const autoEcolesRef = collection(db, "autoecoles");
        const autoEcolesSnapshot = await getDocs(autoEcolesRef);
        const autoEcolesData = autoEcolesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAutoEcoles(autoEcolesData);

        // Load onboarding surveys
        const surveysRef = collection(db, "onboardingSurveys");
        const surveysSnapshot = await getDocs(surveysRef);
        const surveysData = surveysSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setOnboardingSurveys(surveysData);

        // Load all candidates from all auto-écoles
        let allCandidates: any[] = [];
        let allInstructors: any[] = [];

        for (const autoEcole of autoEcolesData) {
          const candidatsRef = collection(db, "autoecoles", autoEcole.id, "candidat");
          const candidatesSnapshot = await getDocs(candidatsRef);
          candidatesSnapshot.docs.forEach(doc => {
            allCandidates.push({
              id: doc.id,
              autoEcoleId: autoEcole.id,
              autoEcoleName: (autoEcole as any).name,
              ...doc.data()
            });
          });

          const moniteurRef = collection(db, "autoecoles", autoEcole.id, "moniteur");
          const instructorsSnapshot = await getDocs(moniteurRef);
          instructorsSnapshot.docs.forEach(doc => {
            allInstructors.push({
              id: doc.id,
              autoEcoleId: autoEcole.id,
              autoEcoleName: (autoEcole as any).name,
              ...doc.data()
            });
          });
        }

        setCandidates(allCandidates);
        setInstructors(allInstructors);
      } else {
        // Regular user: Load only their auto-école data
        if (!userProfile?.autoEcoleId && !userProfile?.uid) return;

        const autoEcoleId = userProfile.autoEcoleId || userProfile.uid;

        // Load candidates from subcollection: autoecoles/{autoEcoleId}/candidat
        const candidatsRef = collection(db, "autoecoles", autoEcoleId, "candidat");
        const candidatesSnapshot = await getDocs(candidatsRef);
        const candidatesData = candidatesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCandidates(candidatesData);

        // Load instructors from subcollection: autoecoles/{autoEcoleId}/moniteur
        const moniteurRef = collection(db, "autoecoles", autoEcoleId, "moniteur");
        const instructorsSnapshot = await getDocs(moniteurRef);
        const instructorsData = instructorsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setInstructors(instructorsData);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get candidate count for each instructor
  const getCandidateCountForInstructor = (instructorId: string) => {
    return candidates.filter(candidate => candidate.moniteurId === instructorId).length;
  };

  // Get recent candidates (last 3)
  const recentCandidates = [...candidates]
    .sort((a, b) => {
      const timeA = a.createdAt?.toMillis?.() || 0;
      const timeB = b.createdAt?.toMillis?.() || 0;
      return timeB - timeA;
    })
    .slice(0, 3);

  const updateStatus = async (status: string) => {
    if (!selectedAutoEcole || !isSuperAdmin) return;
    if (!db) {
      console.error("Firebase Firestore n'est pas initialisé");
      return;
    }
    
    try {
      setActionLoading(selectedAutoEcole.id);
      const autoEcoleRef = doc(db, "autoecoles", selectedAutoEcole.id);
      await updateDoc(autoEcoleRef, {
        status: status,
        updatedAt: Timestamp.now()
      });
      
      setShowStatusModal(false);
      setSelectedAutoEcole(null);
      await loadData();
    } catch (err) {
      console.error("Error updating status:", err);
      showError("Erreur lors de la mise à jour du statut");
    } finally {
      setActionLoading(null);
    }
  };

  const updatePack = async (pack: string | null) => {
    if (!selectedAutoEcole || !isSuperAdmin) return;
    if (!db) {
      console.error("Firebase Firestore n'est pas initialisé");
      return;
    }
    
    try {
      setActionLoading(selectedAutoEcole.id);
      const autoEcoleRef = doc(db, "autoecoles", selectedAutoEcole.id);
      await updateDoc(autoEcoleRef, {
        pack: pack,
        updatedAt: Timestamp.now()
      });
      
      setShowPackModal(false);
      setSelectedAutoEcole(null);
      await loadData();
    } catch (err) {
      console.error("Error updating pack:", err);
      showError("Erreur lors de la mise à jour du pack");
    } finally {
      setActionLoading(null);
    }
  };

  const getPackIcon = (pack?: string) => {
    switch (pack) {
      case "gold": return <Crown className="w-4 h-4 text-yellow-500" />;
      case "silver": return <Star className="w-4 h-4 text-gray-400" />;
      case "bronze": return <Circle className="w-4 h-4 text-orange-600" />;
      default: return <Circle className="w-4 h-4 text-gray-300" />;
    }
  };

  const getPackBadge = (pack?: string) => {
    const badges = {
      gold: "bg-yellow-50 text-yellow-700 border-yellow-200",
      silver: "bg-gray-50 text-gray-700 border-gray-200",
      bronze: "bg-orange-50 text-orange-700 border-orange-200",
      default: "bg-gray-50 text-gray-400 border-gray-200"
    };
    
    return badges[pack as keyof typeof badges] || badges.default;
  };

  // Calculate stats
  const availableInstructors = instructors.filter(i => i.status === "Disponible").length;
  const totalRevenue = autoEcoles.reduce((sum, ae) => sum + (ae.monthlyRevenue || 0), 0);
  const pendingApprovals = autoEcoles.filter(ae => ae.status === "pending").length;

  if (!userProfile && !isSuperAdmin) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A8A] mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Super Admin Welcome Banner */}
      {isSuperAdmin && adminProfile && (
        <div className="bg-linear-to-r from-blue-500 to-orange-500 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Bienvenue, {adminProfile.username}</h1>
              <p className="text-white/90">Tableau de bord Super Admin - Vue d'ensemble complète</p>
              {adminProfile.lastLogin && (
                <p className="text-sm text-blue-100 mt-2">
                  Dernière connexion: {new Date(adminProfile.lastLogin?.toDate?.() || adminProfile.lastLogin).toLocaleString('fr-FR')}
                </p>
              )}
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
              <p className="text-sm font-medium">Rôle</p>
              <p className="text-lg font-bold">{adminProfile.role.toUpperCase()}</p>
            </div>
          </div>
        </div>
      )}
   

      {/* Super Admin: Onboarding Survey Statistics */}
      {isSuperAdmin && onboardingSurveys.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">Statistiques des Questionnaires d'Onboarding</h2>
            <p className="text-sm text-gray-500 mt-1">Analyse des réponses au questionnaire d'intégration</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Réponses</p>
                  <p className="text-4xl font-bold text-blue-900 mt-2">{onboardingSurveys.length}</p>
                </div>
                <FileText className="w-12 h-12 text-blue-500" />
              </div>
            </div>

            <div className="bg-linear-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Candidats</p>
                  <p className="text-4xl font-bold text-green-900 mt-2">
                    {onboardingSurveys.filter((s: any) => s.role === "candidat").length}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {((onboardingSurveys.filter((s: any) => s.role === "candidat").length / onboardingSurveys.length) * 100).toFixed(1)}%
                  </p>
                </div>
                <Users className="w-12 h-12 text-green-500" />
              </div>
            </div>

            <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Moniteurs/Auto-écoles</p>
                  <p className="text-4xl font-bold text-purple-900 mt-2">
                    {onboardingSurveys.filter((s: any) => s.role === "moniteur" || s.role === "autoecole" || s.role === "auto-ecole").length}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    {((onboardingSurveys.filter((s: any) => s.role === "moniteur" || s.role === "autoecole" || s.role === "auto-ecole").length / onboardingSurveys.length) * 100).toFixed(1)}%
                  </p>
                </div>
                <Car className="w-12 h-12 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Detailed Statistics - Candidats */}
          <div className="mb-8">
            <div className="bg-linear-to-r from-green-500 to-blue-500 rounded-lg p-4 mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Users className="w-7 h-7" />
                Réponses des Candidats
              </h2>
              <p className="text-white/90 text-sm mt-1">
                {onboardingSurveys.filter((s: any) => s.role === "candidat").length} réponses collectées
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Q1: Quel est votre objectif en vous inscrivant sur Autoécolie ? */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">
                  Quel est votre objectif en vous inscrivant sur Autoécolie ?
                </h3>
                <div className="space-y-4">
                  {(() => {
                    const candidatSurveys = onboardingSurveys.filter((s: any) => s.role === "candidat");
                    const objectives = candidatSurveys
                      .filter(s => s.objectif)
                      .map(s => s.objectif);
                    
                    const objectiveCounts = objectives.reduce((acc: any, obj: string) => {
                      acc[obj] = (acc[obj] || 0) + 1;
                      return acc;
                    }, {});

                    if (Object.keys(objectiveCounts).length === 0) {
                      return <p className="text-sm text-gray-500">Aucune réponse</p>;
                    }

                    const total = candidatSurveys.length;
                    const maxCount = Math.max(...Object.values(objectiveCounts) as number[]);

                    return Object.entries(objectiveCounts)
                      .sort(([, a]: any, [, b]: any) => b - a)
                      .map(([objective, count]: any, index) => {
                        const percentage = ((count / total) * 100).toFixed(0);
                        const barColors = ['bg-blue-600', 'bg-blue-500', 'bg-blue-400', 'bg-blue-300'];
                        return (
                          <div key={objective}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-900">{objective}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-blue-600">{count}</span>
                                <span className="text-xs text-gray-500">({percentage}%)</span>
                              </div>
                            </div>
                            <div className="w-full bg-white rounded-full h-3 shadow-inner">
                              <div 
                                className={`${barColors[index % barColors.length]} h-3 rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                                style={{ width: `${percentage}%` }}
                              >
                                {parseInt(percentage) > 15 && (
                                  <span className="text-xs font-bold text-white">{percentage}%</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      });
                  })()}
                </div>
              </div>

              {/* Q2: Avez-vous déjà conduit ? */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">
                  Avez-vous déjà conduit ?
                </h3>
                <div className="space-y-4">
                  {(() => {
                    const candidatSurveys = onboardingSurveys.filter((s: any) => s.role === "candidat");
                    const experiences = candidatSurveys
                      .filter(s => s.experienceConduite)
                      .map(s => s.experienceConduite);
                    
                    const experienceCounts = experiences.reduce((acc: any, exp: string) => {
                      acc[exp] = (acc[exp] || 0) + 1;
                      return acc;
                    }, {});

                    if (Object.keys(experienceCounts).length === 0) {
                      return <p className="text-sm text-gray-500">Aucune réponse</p>;
                    }

                    const total = candidatSurveys.length;
                    const barColors = ['bg-green-600', 'bg-green-500', 'bg-green-400'];

                    return Object.entries(experienceCounts)
                      .sort(([, a]: any, [, b]: any) => b - a)
                      .map(([experience, count]: any, index) => {
                        const percentage = ((count / total) * 100).toFixed(0);
                        return (
                          <div key={experience}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-900">{experience}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-green-600">{count}</span>
                                <span className="text-xs text-gray-500">({percentage}%)</span>
                              </div>
                            </div>
                            <div className="w-full bg-white rounded-full h-3 shadow-inner">
                              <div 
                                className={`${barColors[index % barColors.length]} h-3 rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                                style={{ width: `${percentage}%` }}
                              >
                                {parseInt(percentage) > 15 && (
                                  <span className="text-xs font-bold text-white">{percentage}%</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      });
                  })()}
                </div>
              </div>

              {/* Q3: Une plateforme vous serait-elle utile pour faciliter votre permis ? */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">
                  Une plateforme vous serait-elle utile pour faciliter votre permis ?
                </h3>
                <div className="space-y-4">
                  {(() => {
                    const candidatSurveys = onboardingSurveys.filter((s: any) => s.role === "candidat");
                    const features = candidatSurveys
                      .filter(s => s.fonctionnalitesManquantes)
                      .flatMap(s => Array.isArray(s.fonctionnalitesManquantes) ? s.fonctionnalitesManquantes : [s.fonctionnalitesManquantes])
                      .filter(f => f && f.length > 2); // Filter out single characters and "Autre"
                    
                    const featureCounts = features.reduce((acc: any, feature: string) => {
                      acc[feature] = (acc[feature] || 0) + 1;
                      return acc;
                    }, {});

                    if (Object.keys(featureCounts).length === 0) {
                      return <p className="text-sm text-gray-500">Aucune réponse</p>;
                    }

                    const total = features.length;
                    const barColors = ['bg-orange-600', 'bg-orange-500', 'bg-orange-400', 'bg-orange-300'];

                    return Object.entries(featureCounts)
                      .sort(([, a]: any, [, b]: any) => b - a)
                      .map(([feature, count]: any, index) => {
                        const percentage = ((count / total) * 100).toFixed(0);
                        return (
                          <div key={feature}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-900">{feature}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-orange-600">{count}</span>
                                <span className="text-xs text-gray-500">({percentage}%)</span>
                              </div>
                            </div>
                            <div className="w-full bg-white rounded-full h-3 shadow-inner">
                              <div 
                                className={`${barColors[index % barColors.length]} h-3 rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                                style={{ width: `${percentage}%` }}
                              >
                                {parseInt(percentage) > 15 && (
                                  <span className="text-xs font-bold text-white">{percentage}%</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      });
                  })()}
                </div>
              </div>

              {/* Q4: Quelle langue préférez-vous ? */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">
                  Quelle langue préférez-vous ?
                </h3>
                <div className="space-y-4">
                  {(() => {
                    const candidatSurveys = onboardingSurveys.filter((s: any) => s.role === "candidat");
                    const languages = candidatSurveys
                      .filter(s => s.language)
                      .map(s => s.language);
                    
                    const languageCounts = languages.reduce((acc: any, lang: string) => {
                      acc[lang] = (acc[lang] || 0) + 1;
                      return acc;
                    }, {});

                    const languageNames: any = {
                      'fr': 'Français',
                      'ar': 'Arabe',
                      'en': 'Anglais'
                    };

                    if (Object.keys(languageCounts).length === 0) {
                      return <p className="text-sm text-gray-500">Aucune réponse</p>;
                    }

                    const total = candidatSurveys.length;
                    const barColors = ['bg-purple-600', 'bg-purple-500', 'bg-purple-400'];

                    return Object.entries(languageCounts)
                      .sort(([, a]: any, [, b]: any) => b - a)
                      .map(([lang, count]: any, index) => {
                        const percentage = ((count / total) * 100).toFixed(0);
                        return (
                          <div key={lang}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-900">{languageNames[lang] || lang}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-purple-600">{count}</span>
                                <span className="text-xs text-gray-500">({percentage}%)</span>
                              </div>
                            </div>
                            <div className="w-full bg-white rounded-full h-3 shadow-inner">
                              <div 
                                className={`${barColors[index % barColors.length]} h-3 rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                                style={{ width: `${percentage}%` }}
                              >
                                {parseInt(percentage) > 15 && (
                                  <span className="text-xs font-bold text-white">{percentage}%</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      });
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Statistics - Moniteurs/Auto-écoles */}
          <div className="mb-8">
            <div className="bg-linear-to-r from-purple-500 to-pink-500 rounded-lg p-4 mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Car className="w-7 h-7" />
                Réponses des Moniteurs/Auto-écoles
              </h2>
              <p className="text-white/90 text-sm mt-1">
                {onboardingSurveys.filter((s: any) => s.role === "moniteur" || s.role === "autoecole" || s.role === "auto-ecole").length} réponses collectées
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Q1: Quel type de cours donnez-vous ? */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">
                  Quel type de cours donnez-vous ?
                </h3>
                <div className="space-y-4">
                  {(() => {
                    const moniteurSurveys = onboardingSurveys.filter((s: any) => s.role === "moniteur" || s.role === "autoecole" || s.role === "auto-ecole");
                    const types = moniteurSurveys
                      .filter(s => s.typeCours)
                      .flatMap(s => Array.isArray(s.typeCours) ? s.typeCours : [s.typeCours]);
                    
                    const typeCounts = types.reduce((acc: any, type: string) => {
                      acc[type] = (acc[type] || 0) + 1;
                      return acc;
                    }, {});

                    if (Object.keys(typeCounts).length === 0) {
                      return <p className="text-sm text-gray-500">Aucune réponse</p>;
                    }

                    const total = types.length;
                    const barColors = ['bg-indigo-600', 'bg-indigo-500', 'bg-indigo-400', 'bg-indigo-300'];

                    return Object.entries(typeCounts)
                      .sort(([, a]: any, [, b]: any) => b - a)
                      .map(([type, count]: any, index) => {
                        const percentage = ((count / total) * 100).toFixed(0);
                        return (
                          <div key={type}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-900">{type}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-indigo-600">{count}</span>
                                <span className="text-xs text-gray-500">({percentage}%)</span>
                              </div>
                            </div>
                            <div className="w-full bg-white rounded-full h-3 shadow-inner">
                              <div 
                                className={`${barColors[index % barColors.length]} h-3 rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                                style={{ width: `${percentage}%` }}
                              >
                                {parseInt(percentage) > 15 && (
                                  <span className="text-xs font-bold text-white">{percentage}%</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      });
                  })()}
                </div>
              </div>

              {/* Q2: Quel est votre objectif sur Autoécolie ? */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">
                  Quel est votre objectif sur Autoécolie ?
                </h3>
                <div className="space-y-4">
                  {(() => {
                    const moniteurSurveys = onboardingSurveys.filter((s: any) => s.role === "moniteur" || s.role === "autoecole" || s.role === "auto-ecole");
                    const objectives = moniteurSurveys
                      .filter(s => s.objectifMoniteur)
                      .flatMap(s => Array.isArray(s.objectifMoniteur) ? s.objectifMoniteur : [s.objectifMoniteur]);
                    
                    const objectiveCounts = objectives.reduce((acc: any, obj: string) => {
                      acc[obj] = (acc[obj] || 0) + 1;
                      return acc;
                    }, {});

                    if (Object.keys(objectiveCounts).length === 0) {
                      return <p className="text-sm text-gray-500">Aucune réponse</p>;
                    }

                    const total = objectives.length;
                    const barColors = ['bg-red-600', 'bg-red-500', 'bg-red-400', 'bg-red-300'];

                    return Object.entries(objectiveCounts)
                      .sort(([, a]: any, [, b]: any) => b - a)
                      .map(([objective, count]: any, index) => {
                        const percentage = ((count / total) * 100).toFixed(0);
                        return (
                          <div key={objective}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-900">{objective}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-red-600">{count}</span>
                                <span className="text-xs text-gray-500">({percentage}%)</span>
                              </div>
                            </div>
                            <div className="w-full bg-white rounded-full h-3 shadow-inner">
                              <div 
                                className={`${barColors[index % barColors.length]} h-3 rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                                style={{ width: `${percentage}%` }}
                              >
                                {parseInt(percentage) > 15 && (
                                  <span className="text-xs font-bold text-white">{percentage}%</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      });
                  })()}
                </div>
              </div>

              {/* Q3: Qu'est-ce qui pourrait vous empêcher de vous inscrire ou de payer ? */}
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">
                  Qu'est-ce qui pourrait vous empêcher de vous inscrire ou de payer ?
                </h3>
                <div className="space-y-4">
                  {(() => {
                    const moniteurSurveys = onboardingSurveys.filter((s: any) => s.role === "moniteur" || s.role === "autoecole" || s.role === "auto-ecole");
                    const freins = moniteurSurveys
                      .filter(s => s.freins)
                      .flatMap(s => Array.isArray(s.freins) ? s.freins : [s.freins]);
                    
                    const freinCounts = freins.reduce((acc: any, frein: string) => {
                      acc[frein] = (acc[frein] || 0) + 1;
                      return acc;
                    }, {});

                    if (Object.keys(freinCounts).length === 0) {
                      return <p className="text-sm text-gray-500">Aucune réponse</p>;
                    }

                    const total = freins.length;
                    const barColors = ['bg-teal-600', 'bg-teal-500', 'bg-teal-400', 'bg-teal-300'];

                    return Object.entries(freinCounts)
                      .sort(([, a]: any, [, b]: any) => b - a)
                      .map(([frein, count]: any, index) => {
                        const percentage = ((count / total) * 100).toFixed(0);
                        return (
                          <div key={frein}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-900">{frein}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-teal-600">{count}</span>
                                <span className="text-xs text-gray-500">({percentage}%)</span>
                              </div>
                            </div>
                            <div className="w-full bg-white rounded-full h-3 shadow-inner">
                              <div 
                                className={`${barColors[index % barColors.length]} h-3 rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                                style={{ width: `${percentage}%` }}
                              >
                                {parseInt(percentage) > 15 && (
                                  <span className="text-xs font-bold text-white">{percentage}%</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      });
                  })()}
                </div>
              </div>

              {/* Q4: Quelle langue préférez-vous ? */}
              <div className="bg-pink-50 border border-pink-200 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">
                  Quelle langue préférez-vous ?
                </h3>
                <div className="space-y-4">
                  {(() => {
                    const moniteurSurveys = onboardingSurveys.filter((s: any) => s.role === "moniteur" || s.role === "autoecole" || s.role === "auto-ecole");
                    const languages = moniteurSurveys
                      .filter(s => s.language)
                      .map(s => s.language);
                    
                    const languageCounts = languages.reduce((acc: any, lang: string) => {
                      acc[lang] = (acc[lang] || 0) + 1;
                      return acc;
                    }, {});

                    const languageNames: any = {
                      'fr': 'Français',
                      'ar': 'Arabe',
                      'en': 'Anglais'
                    };

                    if (Object.keys(languageCounts).length === 0) {
                      return <p className="text-sm text-gray-500">Aucune réponse</p>;
                    }

                    const total = moniteurSurveys.length;
                    const barColors = ['bg-pink-600', 'bg-pink-500', 'bg-pink-400'];

                    return Object.entries(languageCounts)
                      .sort(([, a]: any, [, b]: any) => b - a)
                      .map(([lang, count]: any, index) => {
                        const percentage = ((count / total) * 100).toFixed(0);
                        return (
                          <div key={lang}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-900">{languageNames[lang] || lang}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-pink-600">{count}</span>
                                <span className="text-xs text-gray-500">({percentage}%)</span>
                              </div>
                            </div>
                            <div className="w-full bg-white rounded-full h-3 shadow-inner">
                              <div 
                                className={`${barColors[index % barColors.length]} h-3 rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                                style={{ width: `${percentage}%` }}
                              >
                                {parseInt(percentage) > 15 && (
                                  <span className="text-xs font-bold text-white">{percentage}%</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      });
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Super Admin: Tunisia Map */}
      {isSuperAdmin && !loading && autoEcoles.length > 0 && (
        <TunisiaMap autoEcoles={autoEcoles} />
      )}

      {/* Super Admin: Users Table with Phone Numbers */}
      {isSuperAdmin && !loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-linear-to-r from-blue-500 to-purple-500 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Users className="w-7 h-7" />
                  Utilisateurs et Numéros de Téléphone
                </h2>
                <p className="text-white/90 text-sm mt-1">
                  {(() => {
                    const filteredSurveys = onboardingSurveys.filter(survey => {
                      if (roleFilter === "all") return true;
                      if (roleFilter === "candidat") return survey.role === "candidat";
                      if (roleFilter === "autoecole") return survey.role === "moniteur" || survey.role === "autoecole" || survey.role === "auto-ecole";
                      return true;
                    });
                    return filteredSurveys.length;
                  })()} utilisateurs affichés
                </p>
              </div>
              
              {/* Filter Dropdown */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm font-medium"
              >
                <option value="all">Tous</option>
                <option value="candidat">Candidat</option>
                <option value="autoecole">Auto-école</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Téléphone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôle
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Onboarding Surveys */}
                {(() => {
                  const filteredSurveys = onboardingSurveys.filter(survey => {
                    if (roleFilter === "all") return true;
                    if (roleFilter === "candidat") return survey.role === "candidat";
                    if (roleFilter === "autoecole") return survey.role === "moniteur" || survey.role === "autoecole" || survey.role === "auto-ecole";
                    return true;
                  });

                  if (filteredSurveys.length === 0) {
                    return (
                      <tr>
                        <td colSpan={2} className="px-6 py-12 text-center text-gray-500">
                          Aucun utilisateur trouvé
                        </td>
                      </tr>
                    );
                  }

                  return filteredSurveys.map((survey) => (
                    <tr key={`survey-${survey.id}`} className="hover:bg-purple-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {survey.phone || survey.telephone || "Non renseigné"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                          <FileText className="w-3 h-3" />
                          {survey.role === "candidat" ? "Candidat" : 
                           survey.role === "moniteur" || survey.role === "autoecole" || survey.role === "auto-ecole" ? "Auto-école/Moniteur" : 
                           survey.role || "N/A"}
                        </span>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>

          {/* Summary Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-end text-sm">
              <span className="text-gray-500">
                Total: <span className="font-semibold text-gray-900">
                  {(() => {
                    const filteredSurveys = onboardingSurveys.filter(survey => {
                      if (roleFilter === "all") return true;
                      if (roleFilter === "candidat") return survey.role === "candidat";
                      if (roleFilter === "autoecole") return survey.role === "moniteur" || survey.role === "autoecole" || survey.role === "auto-ecole";
                      return true;
                    });
                    return filteredSurveys.length;
                  })()}
                </span> utilisateurs
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Super Admin: Auto-écoles List */}

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
            <p className="text-sm text-gray-600 mb-6">
              Auto-école: <span className="font-semibold">{selectedAutoEcole.name}</span>
            </p>
            
            <div className="space-y-3">
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
                    <UserCog className="w-10 h-10 text-gray-400" />
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
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
                    selectedAutoEcole.status === "active" 
                      ? "bg-green-50 text-green-700 border-green-200" 
                      : selectedAutoEcole.status === "inactive"
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-yellow-50 text-yellow-700 border-yellow-200"
                  }`}>
                    {selectedAutoEcole.status === "active" ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {selectedAutoEcole.status?.toUpperCase() || "N/A"}
                  </span>
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

      <ToastContainer />
    </div>
  );
}

