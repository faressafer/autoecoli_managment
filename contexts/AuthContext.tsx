"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { useRouter } from "next/navigation";
import { getUserProfile, getAutoEcole } from "@/lib/firebase/services/autoecoles";
import { getAdminProfile, AdminProfile } from "@/lib/firebase/services/admin";
import { UserProfile, AutoEcole } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  autoEcole: AutoEcole | null;
  adminProfile: AdminProfile | null;
  loading: boolean;
  isSuperAdmin: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  autoEcole: null,
  adminProfile: null,
  loading: true,
  isSuperAdmin: false,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [autoEcole, setAutoEcole] = useState<AutoEcole | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  // Initialize from localStorage synchronously
  const [isSuperAdmin, setIsSuperAdmin] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("superAdmin") === "true";
    }
    return false;
  });
  const router = useRouter();

  const loadUserProfile = async (uid: string) => {
    try {
      const profile = await getUserProfile(uid);
      setUserProfile(profile);
      
      if (profile && (profile.autoEcoleId || profile.uid)) {
        const autoEcoleId = profile.autoEcoleId || profile.uid;
        try {
          const school = await getAutoEcole(autoEcoleId);
          setAutoEcole(school);
        } catch (error) {
          console.error("Error loading auto-école:", error);
          setAutoEcole(null);
        }
      } else {
        setAutoEcole(null);
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
      setUserProfile(null);
      setAutoEcole(null);
    }
  };

  useEffect(() => {
    // Check for super admin status
    const checkSuperAdmin = async () => {
      const superAdminStatus = localStorage.getItem("superAdmin");
      const adminUsername = localStorage.getItem("adminUsername");
      
      if (superAdminStatus === "true" && adminUsername) {
        setIsSuperAdmin(true);
        // Load admin profile from Firebase
        const profile = await getAdminProfile(adminUsername);
        setAdminProfile(profile);
      } else {
        setIsSuperAdmin(false);
        setAdminProfile(null);
      }
    };

    checkSuperAdmin();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      await checkSuperAdmin();
      
      if (user) {
        await loadUserProfile(user.uid);
      } else {
        setUserProfile(null);
        setAutoEcole(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.uid);
    }
  };

  const signOut = async () => {
    try {
      // Clear all state first
      setIsSuperAdmin(false);
      setAdminProfile(null);
      setUserProfile(null);
      setAutoEcole(null);
      
      // Clear localStorage
      localStorage.removeItem("superAdmin");
      localStorage.removeItem("adminUsername");
      
      // Sign out from Firebase
      await firebaseSignOut(auth);
      
      // Force redirect to login
      window.location.href = "/login";
    } catch (error) {
      console.error("Error signing out:", error);
      // Force redirect even on error
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, autoEcole, adminProfile, loading, isSuperAdmin, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

