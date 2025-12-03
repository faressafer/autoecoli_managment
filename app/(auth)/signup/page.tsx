"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "@/lib/firebase/config";
import { createAutoEcole, createUserProfile } from "@/lib/firebase/services/autoecoles";

export default function SignUpPage() {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<"candidate" | "school">("school");
  const [formData, setFormData] = useState<{
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    phone: string;
    schoolName: string;
    address: string;
    city: string;
    postalCode: string;
    siret: string;
    permisTypes: string[];
  }>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    schoolName: "",
    address: "",
    city: "",
    postalCode: "",
    siret: "",
    permisTypes: [],
  });
    // List of permis types with icons
    const permisOptions = [
      { value: "A1", label: "Permis A1", icon: "🏍️" },
      { value: "A", label: "Permis A", icon: "🏍️" },
      { value: "B", label: "Permis B", icon: "🚗" },
      { value: "C", label: "Permis C", icon: "🚚" },
      { value: "C+E", label: "Permis C+E", icon: "🚚" },
      { value: "D", label: "Permis D", icon: "🚌" },
      { value: "D+E", label: "Permis D+E", icon: "🚌" },
      { value: "D1", label: "Permis D1", icon: "🚌" },
      { value: "H", label: "Permis H", icon: "🚜" },
    ];
    // Handler for permis type selection
    const handlePermisTypeChange = (value: string) => {
      setFormData(prev => {
        const selected = prev.permisTypes.includes(value)
          ? prev.permisTypes.filter((v: string) => v !== value)
          : [...prev.permisTypes, value];
        return { ...prev, permisTypes: selected };
      });
    };
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (formData.schoolName && formData.siret) {
        setStep(2);
      }
    } else if (step === 2) {
      // Validate and submit
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    // Validate required fields based on user type
    // Validate required fields
    if (!formData.schoolName || !formData.siret || !formData.address || !formData.city || !formData.postalCode || !formData.phone) {
      setError("Veuillez remplir tous les champs obligatoires");
      setLoading(false);
      return;
    }

    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Update user profile with display name
      const displayName = formData.schoolName;
      
      await updateProfile(user, {
        displayName: displayName
      });

      let logoUrl = "";
      if (logoFile) {
        const storageRef = ref(storage, `Driving school images/${user.uid}`);
        await uploadBytes(storageRef, logoFile);
        logoUrl = await getDownloadURL(storageRef);
      }

      // Créer l'auto-école avec le service (pack will be assigned by admin later)
      await createAutoEcole(
        user.uid,
        user.email!,
        formData.schoolName,
        formData.siret,
        formData.address,
        formData.city,
        formData.postalCode,
        formData.phone,
        logoUrl,
        formData.permisTypes
      );
      
      // Wait a bit for the profile to be created
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Une erreur s'est produite lors de la création du compte");
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError("");

    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      const displayName = user.displayName || user.email?.split("@")[0] || "User";

      // For Google Sign Up, we might need to ask for additional info if it's a new school
      // But for now, let's assume if they are here, they want to be a school
      // However, Google Sign Up bypasses the form, so we might miss required fields like SIRET
      // A better approach would be to redirect to a "complete profile" page
      // For this implementation, we'll just create a basic profile and let them update it later
      // OR, we can force them to fill the form even with Google Sign Up (more complex)
      
      // Simplified: Just create the user profile and redirect to dashboard where they might be prompted to complete info
      // But the requirement says "save the infoamtion of the user and teh driving school"
      // Since we don't have school info from Google Sign Up button click alone, 
      // we should probably hide Google Sign Up or make it just fill the email/auth part.
      
      // Given the prompt "if the user clicks on sign in iwth google and he does not have an account you need to redict hom to register"
      // This implies Google Sign In on Login page redirects to Register.
      // On Register page, Google Sign Up should probably just create the account.
      
      // Let's keep it simple: If they use Google on Signup page, we can't get SIRET etc immediately.
      // We'll create a basic user and maybe they need to complete profile later.
      // BUT the user said "save the infoamtion of the user and teh driving school".
      // So maybe Google Sign Up should be removed from Signup page if we strictly need that info?
      // Or we accept that Google Sign Up creates an incomplete profile.
      
      // Let's stick to the requested flow:
      // "if the user clicks on sign in iwth google and he does not have an account you need to redict hom to register"
      // This was for Login page.
      
      // For Signup page, let's just create a basic school profile if possible, or maybe error out if fields are missing?
      // Actually, if they fill the form and THEN click Google, we can use the form data.
      
      if (formData.schoolName && formData.siret) {
        let logoUrl = "";
        if (logoFile) {
          const storageRef = ref(storage, `Driving school images/${user.uid}`);
          await uploadBytes(storageRef, logoFile);
          logoUrl = await getDownloadURL(storageRef);
        }

        await createAutoEcole(
          user.uid,
          user.email!,
          formData.schoolName,
          formData.siret,
          formData.address || "",
          formData.city || "",
          formData.postalCode || "",
          formData.phone || "",
          logoUrl,
          formData.permisTypes
        );
        
        router.push("/dashboard");
      } else {
        // If they clicked Google without filling the form, we can't create a valid school.
        // We could redirect to a "finish setup" page, but for now let's just error or create basic.
        // Let's error to force them to fill the form or use email/pass.
        // OR better: Just create the user and redirect to dashboard, assuming dashboard handles missing profile.
        // But the prompt was specific about creating the documents.
        
        // Let's try to use what we have or show error.
        setError("Veuillez remplir les informations de l'auto-école avant de s'inscrire avec Google");
        setLoading(false);
        return;
      }
    } catch (err: any) {
      console.error("Google sign-up error:", err);
      setError(err.message || "Une erreur s'est produite lors de l'inscription avec Google");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Background Image */}
      <div 
        className="hidden lg:block lg:w-1/2 bg-cover bg-center relative"
        style={{ backgroundImage: "url('/imageBg.jpg')" }}
      >
        <div className="absolute inset-0 bg-linear-to-r from-[#1E3A8A]/70 to-[#F97316]/70"></div>
      </div>

      {/* Right side - Sign Up Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white overflow-y-auto">
        <div className="max-w-2xl w-full space-y-8">
          <div>
            <h2 className="text-center text-3xl font-bold text-gray-900">
              Créer un compte
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Rejoignez AutoEcoli en quelques étapes
            </p>
          </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step >= 1 ? "bg-[#1E3A8A] text-white" : "bg-gray-200 text-gray-600"
            }`}>
              1
            </div>
            <div className={`w-24 h-1 ${step >= 2 ? "bg-[#1E3A8A]" : "bg-gray-200"}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step >= 2 ? "bg-[#1E3A8A] text-white" : "bg-gray-200 text-gray-600"
            }`}>
              2
            </div>
          </div>
        </div>

        {/* Step 1: School Info */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700">
                Nom de l'auto-école *
              </label>
              <input
                id="schoolName"
                name="schoolName"
                type="text"
                required
                value={formData.schoolName}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              />
            </div>
            <div>
              <label htmlFor="siret" className="block text-sm font-medium text-gray-700">
                Numéro SIRET *
              </label>
              <input
                id="siret"
                name="siret"
                type="text"
                required
                value={formData.siret}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmer le mot de passe *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              />
            </div>

          </div>
        )}

        {/* Step 2: Additional Info */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Adresse *
              </label>
              <input
                id="address"
                name="address"
                type="text"
                required
                value={formData.address}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  Ville *
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  required
                  value={formData.city}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                />
              </div>
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                  Code postal *
                </label>
                <input
                  id="postalCode"
                  name="postalCode"
                  type="text"
                  required
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                />
              </div>
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Téléphone *
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Types de permis offerts *</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {permisOptions.map(opt => (
                  <label key={opt.value} className="flex items-center gap-1 px-2 py-1 border rounded cursor-pointer bg-white hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={formData.permisTypes.includes(opt.value)}
                      onChange={() => handlePermisTypeChange(opt.value)}
                      className="accent-[#1E3A8A]"
                    />
                    <span className="text-black">{opt.icon}</span>
                    <span className="text-sm text-black">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
                Logo de l'auto-école
              </label>
              <input
                id="logo"
                name="logo"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
          )}
          <div className="ml-auto">
            <button
              type="button"
              onClick={handleNext}
              disabled={loading}
              className="px-6 py-2 bg-[#F97316] text-white rounded-lg hover:bg-[#ea580c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Création..." : step === 2 ? "Créer le compte" : "Suivant"}
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Ou</span>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            S'inscrire avec Google
          </button>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Déjà un compte ?{" "}
            <Link
              href="/login"
              className="font-medium text-[#1E3A8A] hover:text-[#F97316]"
            >
              Se connecter
            </Link>
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}

