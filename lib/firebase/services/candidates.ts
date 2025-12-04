import { db } from "@/lib/firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Candidate } from "@/lib/types";

// Create a new candidate
export async function createCandidate(autoEcoleId: string, candidate: Omit<Candidate, "id" | "createdAt" | "updatedAt">): Promise<string> {
  if (!db) {
    throw new Error("Firebase Firestore n'est pas initialisé");
  }
  const candidatesRef = collection(db, "autoecoles", autoEcoleId, "candidat");
  const candidateData = {
    ...candidate,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const docRef = await addDoc(candidatesRef, candidateData);
  return docRef.id;
}
