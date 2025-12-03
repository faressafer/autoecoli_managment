"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Crown, Star, Users, Check, X, Clock, Sparkles, Zap, Shield, TrendingUp, CreditCard, MapPin } from "lucide-react";
import { db } from "@/lib/firebase/config";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

export default function BillingSubscriptionsPage() {
  const { autoEcole } = useAuth();
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set countdown to 7 days from now
  useEffect(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 7);

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const currentPack = autoEcole?.pack || null;
  const isPaid = autoEcole?.packPaid || false; // Check packPaid field set by SuperAdmin

  const handlePaymentRequest = async (paymentMethod: "D17" | "Sur place") => {
    if (!autoEcole?.id) return;
    
    setIsSubmitting(true);
    try {
      await updateDoc(doc(db, "autoecoles", autoEcole.id), {
        paymentMethod: paymentMethod,
        paymentRequestDate: serverTimestamp(),
        paymentStatus: "pending", // SuperAdmin will see this
      });
      
      alert(`Demande de paiement "${paymentMethod}" envoyée avec succès! L'administrateur sera notifié.`);
      setShowPaymentModal(false);
    } catch (error) {
      console.error("Error submitting payment request:", error);
      alert("Erreur lors de l'envoi de la demande. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const packs = [
    {
      id: "bronze",
      name: "Bronze",
      icon: Users,
      color: "from-[#CD7F32] to-[#B8702D]",
      bgColor: "bg-[#CD7F32]/10",
      borderColor: "border-[#CD7F32]/30",
      textColor: "text-[#CD7F32]",
      price: "299",
      originalPrice: "399",
      description: "Parfait pour démarrer votre auto-école",
      features: [
        { name: "Gestion des candidats", included: true },
        { name: "Facturation de base", included: true },
        { name: "Tableau de bord", included: true },
        { name: "Support par email", included: true },
        { name: "Gestion des moniteurs", included: false },
        { name: "Rendez-vous", included: false },
        { name: "Gestion des offres", included: false },
        { name: "Facturation avancée", included: false },
      ],
      permissions: {
        dashboard: true,
        candidats: true,
        moniteurs: false,
        rendezvous: false,
        facturation: true,
        factureB: false,
        offres: false,
        billing: true,
        settings: true,
      },
    },
    {
      id: "silver",
      name: "Silver",
      icon: Star,
      color: "from-[#C0C0C0] to-[#A8A8A8]",
      bgColor: "bg-[#C0C0C0]/10",
      borderColor: "border-[#C0C0C0]/30",
      textColor: "text-[#C0C0C0]",
      price: "499",
      originalPrice: "649",
      description: "Pour les auto-écoles en croissance",
      popular: true,
      features: [
        { name: "Gestion des candidats", included: true },
        { name: "Facturation de base", included: true },
        { name: "Tableau de bord", included: true },
        { name: "Support prioritaire", included: true },
        { name: "Gestion des moniteurs", included: true },
        { name: "Rendez-vous", included: true },
        { name: "Gestion des offres", included: true },
        { name: "Facturation avancée", included: false },
      ],
      permissions: {
        dashboard: true,
        candidats: true,
        moniteurs: true,
        rendezvous: true,
        facturation: true,
        factureB: false,
        offres: true,
        billing: true,
        settings: true,
      },
    },
    {
      id: "gold",
      name: "Gold",
      icon: Crown,
      color: "from-[#D4AF37] to-[#C4A030]",
      bgColor: "bg-[#D4AF37]/10",
      borderColor: "border-[#D4AF37]/30",
      textColor: "text-[#D4AF37]",
      price: "799",
      originalPrice: "999",
      description: "Solution complète pour les professionnels",
      features: [
        { name: "Gestion des candidats", included: true },
        { name: "Facturation de base", included: true },
        { name: "Tableau de bord", included: true },
        { name: "Support 24/7", included: true },
        { name: "Gestion des moniteurs", included: true },
        { name: "Rendez-vous", included: true },
        { name: "Gestion des offres", included: true },
        { name: "Facturation avancée", included: true },
      ],
      permissions: {
        dashboard: true,
        candidats: true,
        moniteurs: true,
        rendezvous: true,
        facturation: true,
        factureB: true,
        offres: true,
        billing: true,
        settings: true,
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
         
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Votre Pack
          </h1>

        </div>

        {/* Countdown Timer */}
        <div className="bg-linear-to-r from-[#F97316] to-[#ea580c] rounded-2xl p-6 shadow-2xl">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-white">
              <Clock className="w-6 h-6 animate-pulse" />
              <h2 className="text-2xl font-bold">L'offre se termine dans</h2>
            </div>
            <div className="flex items-center justify-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 min-w-20">
                <div className="text-4xl font-bold text-white">{timeLeft.days}</div>
                <div className="text-sm text-white/90 font-medium">Jours</div>
              </div>
              <div className="text-3xl font-bold text-white">:</div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 min-w-20">
                <div className="text-4xl font-bold text-white">{timeLeft.hours}</div>
                <div className="text-sm text-white/90 font-medium">Heures</div>
              </div>
              <div className="text-3xl font-bold text-white">:</div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 min-w-20">
                <div className="text-4xl font-bold text-white">{timeLeft.minutes}</div>
                <div className="text-sm text-white/90 font-medium">Minutes</div>
              </div>
              <div className="text-3xl font-bold text-white">:</div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 min-w-20">
                <div className="text-4xl font-bold text-white">{timeLeft.seconds}</div>
                <div className="text-sm text-white/90 font-medium">Secondes</div>
              </div>
            </div>

          </div>
        </div>

        {/* Current Subscription Status */}
        {currentPack ? (
          <div className={`rounded-xl p-6 shadow-lg border-2 ${
            isPaid 
              ? "bg-linear-to-r from-green-50 to-emerald-50 border-green-200" 
              : "bg-linear-to-r from-orange-50 to-red-50 border-orange-200"
          }`}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-linear-to-br ${
                  currentPack === "gold"
                    ? "from-yellow-600 to-yellow-700"
                    : currentPack === "silver"
                    ? "from-gray-400 to-gray-500"
                    : "from-orange-700 to-orange-800"
                } shadow-lg`}>
                  {currentPack === "gold" ? (
                    <Crown className="w-8 h-8 text-white" />
                  ) : currentPack === "silver" ? (
                    <Star className="w-8 h-8 text-white" />
                  ) : (
                    <Users className="w-8 h-8 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Pack Actuel: {currentPack.charAt(0).toUpperCase() + currentPack.slice(1)}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-600">Statut de paiement:</span>
                    {isPaid ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 font-semibold rounded-full text-sm border border-green-300">
                        <Check className="w-4 h-4" />
                        Payé
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 font-semibold rounded-full text-sm border border-orange-300">
                        <Clock className="w-4 h-4" />
                        En attente de paiement
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {!isPaid && (
                <button 
                  onClick={() => setShowPaymentModal(true)}
                  className="px-6 py-3 bg-linear-to-r from-[#F97316] to-[#ea580c] text-white font-semibold rounded-xl hover:from-[#ea580c] hover:to-[#F97316] transition-all shadow-lg hover:shadow-xl"
                >
                  Payer Maintenant
                </button>
              )}
            </div>
            {!isPaid && (
              <div className="mt-4 pt-4 border-t border-orange-200">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Note:</span> Votre pack sera activé dès que le paiement sera confirmé par l'administrateur.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200">
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <X className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun Pack Actif</h3>
              <p className="text-gray-600">Veuillez contacter l'administrateur pour obtenir un pack</p>
            </div>
          </div>
        )}


        {/* Benefits Section */}
        

        {/* Payment Method Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-linear-to-r from-[#1E3A8A] to-[#F97316] mb-4">
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Choisissez votre mode de paiement
                </h2>
                <p className="text-gray-600">
                  Sélectionnez comment vous souhaitez effectuer le paiement
                </p>
              </div>

              <div className="space-y-4">
                {/* D17 Payment Option */}
                <button
                  onClick={() => handlePaymentRequest("D17")}
                  disabled={isSubmitting}
                  className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-[#1E3A8A] hover:bg-blue-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-4">
                    <div className="shrink-0 w-12 h-12 rounded-full bg-linear-to-r from-blue-900 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#1E3A8A] transition-colors">
                        Paiement D17
                      </h3>
                      <p className="text-sm text-gray-600">
                        Paiement en ligne sécurisé via D17
                      </p>
                    </div>
                  </div>
                </button>

                {/* Sur Place Payment Option */}
                <button
                  onClick={() => handlePaymentRequest("Sur place")}
                  disabled={isSubmitting}
                  className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-[#F97316] hover:bg-orange-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-4">
                    <div className="shrink-0 w-12 h-12 rounded-full bg-linear-to-r from-orange-500 to-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#F97316] transition-colors">
                        Paiement Sur Place
                      </h3>
                      <p className="text-sm text-gray-600">
                        Paiement en espèces ou par carte sur place
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Note:</span> Votre demande sera envoyée à l'administrateur qui validera votre paiement.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
