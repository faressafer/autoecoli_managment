import { db } from "@/lib/firebase/config";
import { collection, addDoc, updateDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { Invoice, Payment, Offer } from "@/lib/types";

// Create a new invoice for a candidate
export async function createInvoice(autoEcoleId: string, candidateId: string, offer: Offer): Promise<string> {
  const invoiceRef = collection(db, "autoecoles", autoEcoleId, "invoices");
  const invoiceData = {
    candidateId,
    offerId: offer.id,
    offerName: offer.name,
    totalPrice: offer.price,
    status: "En attente",
    payments: [],
    paidAmount: 0,
    remainingAmount: offer.price,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const docRef = await addDoc(invoiceRef, invoiceData);
  return docRef.id;
}

// Add a payment to an invoice
export async function addPayment(autoEcoleId: string, invoiceId: string, payment: Omit<Payment, "id">): Promise<void> {
  const invoiceDoc = doc(db, "autoecoles", autoEcoleId, "invoices", invoiceId);
  const invoiceSnap = await getDoc(invoiceDoc);
  if (!invoiceSnap.exists()) throw new Error("Invoice not found");
  const invoice = invoiceSnap.data();
  const payments = invoice.payments || [];
  const paidAmount = (invoice.paidAmount || 0) + payment.amount;
  const remainingAmount = invoice.totalPrice - paidAmount;
  let status: Invoice["status"] = "En attente";
  if (paidAmount === 0) status = "En attente";
  else if (paidAmount < invoice.totalPrice) status = "Payée partiellement";
  else status = "Payée";
  await updateDoc(invoiceDoc, {
    payments: [...payments, { ...payment, id: Date.now().toString() }],
    paidAmount,
    remainingAmount,
    status,
    updatedAt: serverTimestamp(),
  });
}
