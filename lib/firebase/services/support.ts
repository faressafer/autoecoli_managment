import { db } from "@/lib/firebase/config";
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  updateDoc, 
  doc,
  onSnapshot,
  QueryConstraint,
  limit
} from "firebase/firestore";
import { SupportRequest } from "@/lib/types";

/**
 * Get all support requests
 */
export async function getAllSupportRequests(
  filterStatus?: string,
  filterSubject?: string,
  limitCount?: number
): Promise<SupportRequest[]> {
  try {
    const supportRef = collection(db, "support");
    const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];

    if (filterStatus && filterStatus !== "all") {
      constraints.push(where("status", "==", filterStatus));
    }

    if (filterSubject && filterSubject !== "all") {
      constraints.push(where("subject", "==", filterSubject));
    }

    if (limitCount) {
      constraints.push(limit(limitCount));
    }

    const q = query(supportRef, ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as SupportRequest[];
  } catch (error) {
    console.error("Error fetching support requests:", error);
    throw error;
  }
}

/**
 * Update support request status
 */
export async function updateSupportStatus(
  requestId: string,
  status: 'pending' | 'in-progress' | 'resolved'
): Promise<void> {
  try {
    const supportRef = doc(db, "support", requestId);
    await updateDoc(supportRef, {
      status,
    });
  } catch (error) {
    console.error("Error updating support status:", error);
    throw error;
  }
}

/**
 * Get support requests count by status
 */
export async function getSupportCountByStatus(): Promise<{
  pending: number;
  inProgress: number;
  resolved: number;
  total: number;
}> {
  try {
    const supportRef = collection(db, "support");
    const allRequests = await getDocs(supportRef);
    
    let pending = 0;
    let inProgress = 0;
    let resolved = 0;

    allRequests.forEach((doc) => {
      const data = doc.data();
      switch (data.status) {
        case 'pending':
          pending++;
          break;
        case 'in-progress':
          inProgress++;
          break;
        case 'resolved':
          resolved++;
          break;
      }
    });

    return {
      pending,
      inProgress,
      resolved,
      total: allRequests.size,
    };
  } catch (error) {
    console.error("Error getting support count:", error);
    return {
      pending: 0,
      inProgress: 0,
      resolved: 0,
      total: 0,
    };
  }
}

/**
 * Subscribe to real-time support requests updates
 */
export function subscribeToSupportRequests(
  callback: (requests: SupportRequest[]) => void,
  filterStatus?: string,
  filterSubject?: string
): () => void {
  try {
    const supportRef = collection(db, "support");
    const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];

    if (filterStatus && filterStatus !== "all") {
      constraints.push(where("status", "==", filterStatus));
    }

    if (filterSubject && filterSubject !== "all") {
      constraints.push(where("subject", "==", filterSubject));
    }

    const q = query(supportRef, ...constraints);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const requests = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SupportRequest[];

      callback(requests);
    });

    return unsubscribe;
  } catch (error) {
    console.error("Error subscribing to support requests:", error);
    return () => {};
  }
}

/**
 * Get pending support requests count
 */
export async function getPendingSupportCount(): Promise<number> {
  try {
    const supportRef = collection(db, "support");
    const q = query(supportRef, where("status", "==", "pending"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error("Error getting pending support count:", error);
    return 0;
  }
}

/**
 * Subscribe to pending support count
 */
export function subscribeToPendingSupportCount(
  callback: (count: number) => void
): () => void {
  try {
    const supportRef = collection(db, "support");
    const q = query(supportRef, where("status", "==", "pending"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      callback(querySnapshot.size);
    });

    return unsubscribe;
  } catch (error) {
    console.error("Error subscribing to pending support count:", error);
    return () => {};
  }
}
