"use client";

import { useState, useEffect } from "react";
import { Users, Car, FileText } from "lucide-react";
import { db } from "@/lib/firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import SurveyContacts from "@/components/questionnaires/SurveyContacts";

export default function QuestionnairesPage() {
  const { isSuperAdmin } = useAuth();
  const [onboardingSurveys, setOnboardingSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSuperAdmin || !db) {
      setLoading(false);
      return;
    }
    getDocs(collection(db, "onboardingSurveys"))
      .then((snapshot) => setOnboardingSurveys(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))))
      .catch((error) => console.error("Error loading onboarding surveys:", error))
      .finally(() => setLoading(false));
  }, [isSuperAdmin]);

  if (!isSuperAdmin) {
    return <div className="p-8 text-center text-gray-600">Cette page est réservée au Super Admin.</div>;
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A8A]"></div>
      </div>
    );
  }

  if (onboardingSurveys.length === 0) {
    return <div className="p-8 text-center text-gray-600">Aucune réponse au questionnaire pour le moment.</div>;
  }

  return (
    <div className="p-4 space-y-6">
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

      <SurveyContacts surveys={onboardingSurveys} />
    </div>
  );
}
