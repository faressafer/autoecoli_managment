import { db } from "@/lib/firebase/config";
import { doc, getDoc, setDoc, collection, getDocs, serverTimestamp } from "firebase/firestore";

export interface AdminProfile {
  id: string;
  username: string;
  email?: string;
  role: "superadmin";
  createdAt: any;
  updatedAt: any;
  lastLogin?: any;
}

/**
 * Get admin profile by username
 */
export async function getAdminProfile(username: string): Promise<AdminProfile | null> {
  try {
    const adminRef = doc(db, "Admin", username);
    const adminSnap = await getDoc(adminRef);

    if (adminSnap.exists()) {
      return { id: adminSnap.id, ...adminSnap.data() } as AdminProfile;
    }

    return null;
  } catch (error) {
    console.error("Error getting admin profile:", error);
    return null;
  }
}

/**
 * Verify admin credentials
 */
export async function verifyAdminCredentials(username: string, password: string): Promise<boolean> {
  try {
    const adminRef = doc(db, "Admin", username);
    const adminSnap = await getDoc(adminRef);

    if (adminSnap.exists()) {
      const adminData = adminSnap.data();
      return adminData.password === password;
    }

    return false;
  } catch (error) {
    console.error("Error verifying admin credentials:", error);
    return false;
  }
}

/**
 * Create or update admin login timestamp
 */
export async function updateAdminLogin(username: string): Promise<void> {
  try {
    const adminRef = doc(db, "Admin", username);
    const adminSnap = await getDoc(adminRef);

    if (adminSnap.exists()) {
      // Update last login
      await setDoc(adminRef, {
        lastLogin: serverTimestamp(),
      }, { merge: true });
    } else {
      // Create admin document if it doesn't exist
      await setDoc(adminRef, {
        username,
        password: "admin", // Default password
        role: "superadmin",
        email: "autooecoli@gmail.com",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("Error updating admin login:", error);
  }
}

/**
 * Get all admins
 */
export async function getAllAdmins(): Promise<AdminProfile[]> {
  try {
    const adminsRef = collection(db, "Admin");
    const adminsSnap = await getDocs(adminsRef);

    return adminsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AdminProfile[];
  } catch (error) {
    console.error("Error getting all admins:", error);
    return [];
  }
}

/**
 * Initialize default admin account
 */
export async function initializeDefaultAdmin(): Promise<void> {
  try {
    const adminRef = doc(db, "Admin", "admin");
    const adminSnap = await getDoc(adminRef);

    if (!adminSnap.exists()) {
      await setDoc(adminRef, {
        username: "admin",
        password: "admin",
        role: "superadmin",
        email: "autooecoli@gmail.com",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log("Default admin account created successfully");
    }
  } catch (error) {
    console.error("Error initializing default admin:", error);
  }
}
