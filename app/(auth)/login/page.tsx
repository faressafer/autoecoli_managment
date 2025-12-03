"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile } from "@/lib/firebase/services/autoecoles";
import { verifyAdminCredentials, updateAdminLogin } from "@/lib/firebase/services/admin";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [userType, setUserType] = useState<"candidate" | "school">("candidate");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { user, loading: authLoading, isSuperAdmin } = useAuth();

  // Redirect if already authenticated (either as user or super admin)
  useEffect(() => {
    if (!authLoading && (user || isSuperAdmin)) {
      router.push("/dashboard");
    }
  }, [user, authLoading, isSuperAdmin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Check if trying to login as admin (by username or email)
      const isAdminAttempt = email === "admin" ||
        email.toLowerCase() === "admin@autoecoli.com" ||
        email.toLowerCase().includes("autoecoli");

      if (isAdminAttempt) {
        // For email login, use "admin" as username to check credentials
        const usernameToCheck = email.includes("@") ? "admin" : email;

        // Verify admin credentials from Firebase Admin collection
        const isValidAdmin = await verifyAdminCredentials(usernameToCheck, password);

        if (isValidAdmin) {
          // Update admin login timestamp in Firebase
          await updateAdminLogin(usernameToCheck);
          // Store super admin session
          localStorage.setItem("superAdmin", "true");
          localStorage.setItem("adminUsername", usernameToCheck);
          // Force redirect to dashboard
          window.location.href = "/dashboard";
          return;
        } else {
          setError("Identifiants administrateur invalides");
          setLoading(false);
          return;
        }
      }

      // Regular user login with Firebase Auth
      await signInWithEmailAndPassword(auth, email, password);
      // Clear super admin flag if it exists
      localStorage.removeItem("superAdmin");
      localStorage.removeItem("adminUsername");
      // Success - redirect based on user type
      if (userType === "school") {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/";
      }
    } catch (err: any) {
      setError(err.message || "Une erreur s'est produite lors de la connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user profile exists
      const profile = await getUserProfile(user.uid);

      if (!profile) {
        // Redirect to signup if no profile exists
        window.location.href = "/signup";
        return;
      }

      // Success - redirect based on user type/profile
      if (profile.role === "admin" || profile.autoEcoleId) {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/";
      }
    } catch (err: any) {
      setError(err.message || "Une erreur s'est produite lors de la connexion avec Google");
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F97316] mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Don't render login form if user is authenticated (will redirect)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Background Image */}
      <div
        className="hidden lg:block lg:w-1/2 bg-cover bg-center relative"
        style={{ backgroundImage: "url('/imageBg.jpg')" }}
      >
        <div className="absolute inset-0 bg-linear-to-r from-[#1E3A8A]/70 to-[#F97316]/70"></div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-blue-50 via-white to-orange-50">
        <div className="max-w-md w-full space-y-8">
          <div>
            <Link href="/" className="flex justify-center mb-6">
              <img src="/logo.png" alt="Logo" className="h-40 w-auto cursor-pointer hover:opacity-90 transition-opacity" />
            </Link>
            <h2 className="text-center text-3xl font-bold text-gray-900">
              Connexion
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Connectez-vous à votre compte
            </p>
          </div>

          {/* User Type Selector */}
          {/* <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setUserType("candidate")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              userType === "candidate"
                ? "bg-[#1E3A8A] text-white"
                : "text-gray-700 hover:text-gray-900"
            }`}
          >
            Candidat
          </button>
          <button
            type="button"
            onClick={() => setUserType("school")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              userType === "school"
                ? "bg-[#1E3A8A] text-white"
                : "text-gray-700 hover:text-gray-900"
            }`}
          >
            Auto-école
          </button>
        </div> */}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400"
                  placeholder="votre@email.com"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#1E3A8A] focus:ring-[#1E3A8A] border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Se souvenir de moi
                </label>
              </div>

            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#F97316] hover:bg-[#ea580c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F97316] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Connexion..." : "Se connecter"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

