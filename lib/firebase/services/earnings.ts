import { db } from "@/lib/firebase/config";
import { collection, getDocs } from "firebase/firestore";

// Get total earnings and outstanding for an autoecole
export async function getEarnings(autoEcoleId: string) {
  if (!db) {
    throw new Error("Firebase Firestore n'est pas initialisé");
  }
  const invoicesRef = collection(db, "autoecoles", autoEcoleId, "invoices");
  const snapshot = await getDocs(invoicesRef);
  let totalPaid = 0;
  let totalOutstanding = 0;
  snapshot.forEach(doc => {
    const invoice = doc.data();
    totalPaid += invoice.paidAmount || 0;
    totalOutstanding += invoice.remainingAmount || 0;
  });
  return { totalPaid, totalOutstanding };
}
