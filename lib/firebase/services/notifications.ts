import { db } from "@/lib/firebase/config";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  updateDoc, 
  doc, 
  serverTimestamp,
  onSnapshot,
  QueryConstraint,
  limit,
  Timestamp
} from "firebase/firestore";
import { Notification } from "@/lib/types";

/**
 * Create a new notification
 */
export async function createNotification(
  autoEcoleId: string,
  autoEcoleName: string,
  type: 'info' | 'warning' | 'success' | 'error' | 'payment' | 'pack' | 'general',
  title: string,
  message: string,
  metadata?: Record<string, any>
): Promise<string> {
  try {
    const notificationsRef = collection(db, "notifications");
    
    const docRef = await addDoc(notificationsRef, {
      autoEcoleId,
      autoEcoleName,
      type,
      title,
      message,
      read: false,
      metadata: metadata || {},
      createdAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

/**
 * Get all notifications (for super admin)
 */
export async function getAllNotifications(
  filterType?: string,
  limitCount?: number
): Promise<Notification[]> {
  try {
    const notificationsRef = collection(db, "notifications");
    const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];

    if (filterType && filterType !== "all") {
      constraints.push(where("type", "==", filterType));
    }

    if (limitCount) {
      constraints.push(limit(limitCount));
    }

    const q = query(notificationsRef, ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Notification[];
  } catch (error) {
    console.error("Error fetching all notifications:", error);
    throw error;
  }
}

/**
 * Get notifications for a specific auto-école
 */
export async function getNotificationsByAutoEcole(
  autoEcoleId: string,
  filterType?: string,
  limitCount?: number
): Promise<Notification[]> {
  try {
    const notificationsRef = collection(db, "notifications");
    const constraints: QueryConstraint[] = [
      where("autoEcoleId", "==", autoEcoleId),
      orderBy("createdAt", "desc"),
    ];

    if (filterType && filterType !== "all") {
      constraints.push(where("type", "==", filterType));
    }

    if (limitCount) {
      constraints.push(limit(limitCount));
    }

    const q = query(notificationsRef, ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Notification[];
  } catch (error) {
    console.error("Error fetching notifications by auto-école:", error);
    throw error;
  }
}

/**
 * Get unread notifications count
 */
export async function getUnreadNotificationsCount(
  autoEcoleId?: string
): Promise<number> {
  try {
    const notificationsRef = collection(db, "notifications");
    const constraints: QueryConstraint[] = [where("read", "==", false)];

    if (autoEcoleId) {
      constraints.push(where("autoEcoleId", "==", autoEcoleId));
    }

    const q = query(notificationsRef, ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.size;
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return 0;
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(
  notificationId: string
): Promise<void> {
  try {
    const notificationRef = doc(db, "notifications", notificationId);
    await updateDoc(notificationRef, {
      read: true,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(
  autoEcoleId?: string
): Promise<void> {
  try {
    const notificationsRef = collection(db, "notifications");
    const constraints: QueryConstraint[] = [where("read", "==", false)];

    if (autoEcoleId) {
      constraints.push(where("autoEcoleId", "==", autoEcoleId));
    }

    const q = query(notificationsRef, ...constraints);
    const querySnapshot = await getDocs(q);

    const updatePromises = querySnapshot.docs.map((docSnapshot) =>
      updateDoc(doc(db, "notifications", docSnapshot.id), {
        read: true,
      })
    );

    await Promise.all(updatePromises);
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
}

/**
 * Listen to real-time notification updates
 */
export function subscribeToNotifications(
  callback: (notifications: Notification[]) => void,
  autoEcoleId?: string
): () => void {
  try {
    const notificationsRef = collection(db, "notifications");
    const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];

    if (autoEcoleId) {
      constraints.push(where("autoEcoleId", "==", autoEcoleId));
    }

    const q = query(notificationsRef, ...constraints);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const notifications = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Notification[];

      callback(notifications);
    });

    return unsubscribe;
  } catch (error) {
    console.error("Error subscribing to notifications:", error);
    return () => {};
  }
}

/**
 * Listen to real-time unread count updates
 */
export function subscribeToUnreadCount(
  callback: (count: number) => void,
  autoEcoleId?: string
): () => void {
  try {
    const notificationsRef = collection(db, "notifications");
    const constraints: QueryConstraint[] = [where("read", "==", false)];

    if (autoEcoleId) {
      constraints.push(where("autoEcoleId", "==", autoEcoleId));
    }

    const q = query(notificationsRef, ...constraints);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      callback(querySnapshot.size);
    });

    return unsubscribe;
  } catch (error) {
    console.error("Error subscribing to unread count:", error);
    return () => {};
  }
}
