import { db } from "@/lib/firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Offer } from "@/lib/types";

// Create a new offer
export async function createOffer(autoEcoleId: string, offer: Omit<Offer, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const offersRef = collection(db, "autoecoles", autoEcoleId, "offers");
  const offerData = {
    ...offer,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const docRef = await addDoc(offersRef, offerData);
  return docRef.id;
}
