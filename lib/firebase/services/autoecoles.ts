import { db } from "@/lib/firebase/config";
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { UserProfile, AutoEcole } from "@/lib/types";

/**
 * Create a new auto-école
 */
export async function createAutoEcole(
  ownerId: string,
  ownerEmail: string,
  schoolName: string,
  siret: string,
  address: string,
  city: string,
  postalCode: string,
  phone: string,
  logoUrl?: string,
  permisTypes?: string[]
  ): Promise<string> {
  try {
    const autoEcoleRef = doc(db, "autoecoles", ownerId);
    
    await setDoc(autoEcoleRef, {
      name: schoolName,
      siret,
      address,
      city,
      postalCode,
      phone,
      logo: logoUrl || null,
      email: ownerEmail,
      ownerId,
      permisTypes: permisTypes || [],
      pack: null, // Will be assigned by AutoEcoli admin later
      status: "pending", // Initial status: pending approval from super admin
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Create owner profile
    await setDoc(doc(db, "users", ownerId), {
      uid: ownerId,
      email: ownerEmail,
      displayName: schoolName,
      role: "admin",
      autoEcoleId: ownerId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return ownerId;
  } catch (error) {
    console.error("Error creating auto-école:", error);
    throw error;
  }
}

/**
 * Create a new user profile
 */
export async function createUserProfile(
  uid: string,
  email: string,
  role: string,
  displayName: string,
  autoEcoleId?: string
): Promise<void> {
  try {
    await setDoc(doc(db, "users", uid), {
      uid,
      email,
      displayName,
      role,
      autoEcoleId: autoEcoleId || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
}

/**
 * Get user profile from Firestore
 */
export async function getUserProfile(uid: string, retryCount = 0): Promise<UserProfile | null> {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        uid: userDoc.id,
        email: data.email,
        displayName: data.displayName,
        autoEcoleId: data.autoEcoleId,
        role: data.role || 'candidate',
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as UserProfile;
    }
    
    // Retry up to 3 times if profile doesn't exist yet (might be still creating)
    if (retryCount < 3) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return getUserProfile(uid, retryCount + 1);
    }
    
    return null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
}

/**
 * Create or update user profile
 */
export async function setUserProfile(uid: string, profile: Partial<UserProfile>): Promise<void> {
  try {
    const userRef = doc(db, "users", uid);
    const now = new Date();
    
    await setDoc(userRef, {
      ...profile,
      uid,
      updatedAt: now,
      createdAt: now,
    }, { merge: true });
  } catch (error) {
    console.error("Error setting user profile:", error);
    throw error;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}

/**
 * Get auto-école details
 */
export async function getAutoEcole(autoEcoleId: string): Promise<AutoEcole | null> {
  try {
    const autoEcoleDoc = await getDoc(doc(db, "autoecoles", autoEcoleId));
    
    if (autoEcoleDoc.exists()) {
      const data = autoEcoleDoc.data();
      return {
        id: autoEcoleDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as AutoEcole;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting auto-école:", error);
    throw error;
  }
}

/**
 * Get all auto-écoles
 */
export async function getAllAutoEcoles(): Promise<AutoEcole[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "autoecoles"));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as AutoEcole[];
  } catch (error) {
    console.error("Error getting auto-écoles:", error);
    throw error;
  }
}

/**
 * Get users by auto-école ID
 */
export async function getUsersByAutoEcole(autoEcoleId: string): Promise<UserProfile[]> {
  try {
    const q = query(
      collection(db, "users"),
      where("autoEcoleId", "==", autoEcoleId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as UserProfile[];
  } catch (error) {
    console.error("Error getting users by auto-école:", error);
    throw error;
  }
}

/**
 * Update auto-école sidebar permissions
 */
export async function updateAutoEcoleSidebarPermissions(
  autoEcoleId: string,
  permissions: any
): Promise<void> {
  try {
    const autoEcoleRef = doc(db, "autoecoles", autoEcoleId);
    await updateDoc(autoEcoleRef, {
      sidebarPermissions: permissions,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating sidebar permissions:", error);
    throw error;
  }
}
