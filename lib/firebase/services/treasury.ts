import { db } from "@/lib/firebase/config";
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp 
} from "firebase/firestore";

export interface TreasuryTransaction {
  id: string;
  type: "entree" | "sortie";
  montant: number;
  description: string;
  categorie: string;
  methodePayement: string;
  reference: string;
  date: Date;
  creePar: string;
  statut: "valide" | "en_attente" | "annule";
  createdAt: Date;
  updatedAt: Date;
}

export interface TreasurySummary {
  totalEntrees: number;
  totalSorties: number;
  solde: number;
  nombreTransactions: number;
  derniereMAJ: Date;
}

/**
 * Get treasury document from Admin collection
 */
export async function getTreasuryDocument(): Promise<any> {
  try {
    const treasuryRef = doc(db, "Admin", "tresorie");
    const treasurySnap = await getDoc(treasuryRef);

    if (treasurySnap.exists()) {
      return { id: treasurySnap.id, ...treasurySnap.data() };
    }

    // Initialize treasury document if it doesn't exist
    await initializeTreasuryDocument();
    return getTreasuryDocument();
  } catch (error) {
    console.error("Error getting treasury document:", error);
    throw error;
  }
}

/**
 * Initialize treasury document
 */
export async function initializeTreasuryDocument(): Promise<void> {
  try {
    const treasuryRef = doc(db, "Admin", "tresorie");
    await setDoc(treasuryRef, {
      totalEntrees: 0,
      totalSorties: 0,
      solde: 0,
      nombreTransactions: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error initializing treasury document:", error);
    throw error;
  }
}

/**
 * Get all treasury transactions
 */
export async function getTreasuryTransactions(): Promise<TreasuryTransaction[]> {
  try {
    const transactionsRef = collection(db, "Admin", "tresorie", "transactions");
    const q = query(transactionsRef, orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as TreasuryTransaction[];
  } catch (error) {
    console.error("Error getting treasury transactions:", error);
    throw error;
  }
}

/**
 * Get treasury transactions by type
 */
export async function getTreasuryTransactionsByType(type: "entree" | "sortie"): Promise<TreasuryTransaction[]> {
  try {
    const transactionsRef = collection(db, "Admin", "tresorie", "transactions");
    const q = query(
      transactionsRef, 
      where("type", "==", type),
      orderBy("date", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as TreasuryTransaction[];
  } catch (error) {
    console.error("Error getting treasury transactions by type:", error);
    throw error;
  }
}

/**
 * Get treasury transactions by category
 */
export async function getTreasuryTransactionsByCategory(categorie: string): Promise<TreasuryTransaction[]> {
  try {
    const transactionsRef = collection(db, "Admin", "tresorie", "transactions");
    const q = query(
      transactionsRef, 
      where("categorie", "==", categorie),
      orderBy("date", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as TreasuryTransaction[];
  } catch (error) {
    console.error("Error getting treasury transactions by category:", error);
    throw error;
  }
}

/**
 * Add a new treasury transaction
 */
export async function addTreasuryTransaction(
  transaction: Omit<TreasuryTransaction, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  try {
    const transactionsRef = collection(db, "Admin", "tresorie", "transactions");
    
    // Add transaction
    const docRef = await addDoc(transactionsRef, {
      ...transaction,
      date: Timestamp.fromDate(transaction.date),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Update treasury summary
    await updateTreasurySummary();

    return docRef.id;
  } catch (error) {
    console.error("Error adding treasury transaction:", error);
    throw error;
  }
}

/**
 * Update a treasury transaction
 */
export async function updateTreasuryTransaction(
  transactionId: string,
  updates: Partial<TreasuryTransaction>
): Promise<void> {
  try {
    const transactionRef = doc(db, "Admin", "tresorie", "transactions", transactionId);
    
    const updateData: any = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    // Convert date if provided
    if (updates.date) {
      updateData.date = Timestamp.fromDate(updates.date);
    }

    await updateDoc(transactionRef, updateData);

    // Update treasury summary
    await updateTreasurySummary();
  } catch (error) {
    console.error("Error updating treasury transaction:", error);
    throw error;
  }
}

/**
 * Delete a treasury transaction
 */
export async function deleteTreasuryTransaction(transactionId: string): Promise<void> {
  try {
    const transactionRef = doc(db, "Admin", "tresorie", "transactions", transactionId);
    await deleteDoc(transactionRef);

    // Update treasury summary
    await updateTreasurySummary();
  } catch (error) {
    console.error("Error deleting treasury transaction:", error);
    throw error;
  }
}

/**
 * Update treasury summary (recalculate totals)
 */
export async function updateTreasurySummary(): Promise<void> {
  try {
    const transactions = await getTreasuryTransactions();
    
    let totalEntrees = 0;
    let totalSorties = 0;

    transactions.forEach(transaction => {
      if (transaction.statut === "valide") {
        if (transaction.type === "entree") {
          totalEntrees += transaction.montant;
        } else if (transaction.type === "sortie") {
          totalSorties += transaction.montant;
        }
      }
    });

    const solde = totalEntrees - totalSorties;

    const treasuryRef = doc(db, "Admin", "tresorie");
    const treasurySnap = await getDoc(treasuryRef);
    
    if (treasurySnap.exists()) {
      await updateDoc(treasuryRef, {
        totalEntrees,
        totalSorties,
        solde,
        nombreTransactions: transactions.length,
        updatedAt: serverTimestamp(),
      });
    } else {
      // Create the document if it doesn't exist
      await setDoc(treasuryRef, {
        totalEntrees,
        totalSorties,
        solde,
        nombreTransactions: transactions.length,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("Error updating treasury summary:", error);
    throw error;
  }
}

/**
 * Get treasury summary
 */
export async function getTreasurySummary(): Promise<TreasurySummary> {
  try {
    const treasuryDoc = await getTreasuryDocument();
    
    return {
      totalEntrees: treasuryDoc.totalEntrees || 0,
      totalSorties: treasuryDoc.totalSorties || 0,
      solde: treasuryDoc.solde || 0,
      nombreTransactions: treasuryDoc.nombreTransactions || 0,
      derniereMAJ: treasuryDoc.updatedAt?.toDate() || new Date(),
    };
  } catch (error) {
    console.error("Error getting treasury summary:", error);
    throw error;
  }
}

/**
 * Get treasury transactions by date range
 */
export async function getTreasuryTransactionsByDateRange(
  startDate: Date,
  endDate: Date
): Promise<TreasuryTransaction[]> {
  try {
    const transactionsRef = collection(db, "Admin", "tresorie", "transactions");
    const q = query(
      transactionsRef,
      where("date", ">=", Timestamp.fromDate(startDate)),
      where("date", "<=", Timestamp.fromDate(endDate)),
      orderBy("date", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as TreasuryTransaction[];
  } catch (error) {
    console.error("Error getting treasury transactions by date range:", error);
    throw error;
  }
}

/**
 * Get treasury statistics by category
 */
export async function getTreasuryStatsByCategory(): Promise<{
  categorie: string;
  entrees: number;
  sorties: number;
  total: number;
}[]> {
  try {
    const transactions = await getTreasuryTransactions();
    const statsMap = new Map<string, { entrees: number; sorties: number }>();

    transactions.forEach(transaction => {
      if (transaction.statut === "valide") {
        const current = statsMap.get(transaction.categorie) || { entrees: 0, sorties: 0 };
        
        if (transaction.type === "entree") {
          current.entrees += transaction.montant;
        } else {
          current.sorties += transaction.montant;
        }
        
        statsMap.set(transaction.categorie, current);
      }
    });

    return Array.from(statsMap.entries()).map(([categorie, stats]) => ({
      categorie,
      entrees: stats.entrees,
      sorties: stats.sorties,
      total: stats.entrees - stats.sorties,
    }));
  } catch (error) {
    console.error("Error getting treasury stats by category:", error);
    throw error;
  }
}

/**
 * Record auto-école payment to treasury
 * This function should be called when an auto-école makes a payment
 */
export async function recordAutoEcolePayment(
  autoEcoleId: string,
  autoEcoleName: string,
  montant: number,
  description: string,
  methodePayement: string,
  reference: string,
  creePar: string
): Promise<string> {
  try {
    return await addTreasuryTransaction({
      type: "entree",
      montant,
      description: `Paiement ${autoEcoleName} - ${description}`,
      categorie: "Paiement Auto-école",
      methodePayement,
      reference: reference || `AE-${autoEcoleId}-${Date.now()}`,
      date: new Date(),
      creePar,
      statut: "valide",
    });
  } catch (error) {
    console.error("Error recording auto-école payment:", error);
    throw error;
  }
}
