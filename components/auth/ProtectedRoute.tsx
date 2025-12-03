"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isSuperAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user && !isSuperAdmin) {
      router.push("/login");
    }
  }, [user, loading, isSuperAdmin, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user && !isSuperAdmin) {
    return null;
  }

  return <>{children}</>;
}

