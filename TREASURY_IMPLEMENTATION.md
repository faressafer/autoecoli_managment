# Treasury Management System - Implementation Guide

## Overview
The treasury management system is now set up under `Admin/tresorie` in Firestore to centralize all financial transactions for AutoEcoli platform.

## Firestore Structure

```
Firestore
└── Admin (Collection)
    └── tresorie (Document)
        ├── totalEntrees: number
        ├── totalSorties: number
        ├── solde: number
        ├── nombreTransactions: number
        ├── createdAt: timestamp
        └── updatedAt: timestamp
        └── transactions (Subcollection)
            └── {transactionId} (Document)
                ├── type: "entree" | "sortie"
                ├── montant: number
                ├── description: string
                ├── categorie: string
                ├── methodePayement: string
                ├── reference: string
                ├── date: timestamp
                ├── creePar: string
                ├── statut: "valide" | "en_attente" | "annule"
                ├── createdAt: timestamp
                └── updatedAt: timestamp
```

## How Auto-Écoles Currently Pay

Based on the current codebase analysis:

### Current Payment System
1. **Location**: `autoecoles/{autoEcoleId}/invoices` collection
2. **Payment Flow**:
   - Invoices are created for candidates under each auto-école
   - Payments are tracked within invoice documents
   - Each payment has: amount, date, method, reference
   - Invoice status: "En attente", "Payée partiellement", "Payée"

### Current Payment Tracking
- **Earnings Service** (`earnings.ts`):
  - Tracks `totalPaid` and `totalOutstanding` per auto-école
  - Calculated from individual invoices
  - No centralized treasury tracking

## Recommendations for Integration

### ✅ RECOMMENDED APPROACH: Dual Tracking System

#### Why This Approach?
1. **Maintain Business Logic**: Keep auto-école invoices separate for their own accounting
2. **Centralized Treasury**: Have a global view of all platform revenue
3. **Audit Trail**: Complete financial transparency
4. **Flexibility**: Each auto-école manages their invoices independently

#### Implementation Strategy:

### 1. **Auto-École Payment Flow Integration**

When an auto-école makes a payment (through their invoice system):

```typescript
// In invoices.ts - after updating invoice payment
export async function addPayment(
  autoEcoleId: string, 
  invoiceId: string, 
  payment: Omit<Payment, "id">
): Promise<void> {
  // ... existing invoice update code ...
  
  // NEW: Record in treasury if it's a platform fee/subscription
  if (shouldRecordInTreasury(payment)) {
    await recordAutoEcolePayment(
      autoEcoleId,
      autoEcoleName,
      payment.amount,
      `Paiement facture ${invoiceId}`,
      payment.method,
      payment.reference || `INV-${invoiceId}`,
      "system"
    );
  }
}
```

### 2. **When to Record in Treasury**

**DO RECORD** in treasury for:
- ✅ Monthly subscription fees from auto-écoles
- ✅ Pack upgrade fees (Bronze → Silver → Gold)
- ✅ Platform commission on candidate payments
- ✅ One-time setup fees
- ✅ Additional service fees (SMS, reports, etc.)

**DON'T RECORD** in treasury for:
- ❌ Candidate payments that go directly to auto-école
- ❌ Internal auto-école transactions
- ❌ Refunds between auto-école and candidates

### 3. **Recommended Transaction Categories**

```typescript
const TREASURY_CATEGORIES = {
  // Entrées (Income)
  "Abonnement Auto-école": "Monthly/annual subscriptions",
  "Commission Formation": "Commission on training fees",
  "Frais d'installation": "Setup fees for new schools",
  "Upgrade Pack": "Pack upgrade fees",
  "Services Additionnels": "Extra services (SMS, reports)",
  "Partenariats": "Partner revenue",
  
  // Sorties (Expenses)
  "Salaires": "Employee salaries",
  "Infrastructure": "Servers, hosting, cloud services",
  "Marketing": "Advertising and promotions",
  "Développement": "Development and maintenance",
  "Support": "Customer support costs",
  "Licences": "Software licenses",
  "Autre": "Other expenses"
};
```

### 4. **Automated Payment Recording**

Create a middleware function to automatically record treasury transactions:

```typescript
// lib/firebase/services/payment-middleware.ts
export async function processAutoEcolePayment(
  autoEcoleId: string,
  paymentType: "subscription" | "commission" | "setup" | "upgrade",
  amount: number,
  details: any
): Promise<void> {
  // 1. Update auto-école invoice/balance
  await updateAutoEcoleInvoice(autoEcoleId, amount, details);
  
  // 2. Record in treasury
  await recordAutoEcolePayment(
    autoEcoleId,
    details.autoEcoleName,
    amount,
    generateDescription(paymentType, details),
    details.methodePayement,
    details.reference,
    details.creePar || "system"
  );
  
  // 3. Update auto-école payment status
  await updateAutoEcolePaymentStatus(autoEcoleId, paymentType);
}
```

### 5. **Commission Calculation System**

For commission-based revenue tracking:

```typescript
export async function calculateAndRecordCommission(
  autoEcoleId: string,
  candidatePayment: number,
  commissionRate: number // e.g., 0.08 for 8%
): Promise<void> {
  const commissionAmount = candidatePayment * commissionRate;
  
  await recordAutoEcolePayment(
    autoEcoleId,
    autoEcoleName,
    commissionAmount,
    `Commission ${commissionRate * 100}% sur paiement candidat`,
    "automatique",
    `COM-${autoEcoleId}-${Date.now()}`,
    "system"
  );
}
```

## Integration with Caisse Page

### Update the Caisse Page to Use Treasury Service

```typescript
// app/(main)/caisse/page.tsx
import {
  getTreasuryTransactions,
  addTreasuryTransaction,
  deleteTreasuryTransaction,
  getTreasurySummary
} from "@/lib/firebase/services/treasury";

// Replace local state with Firebase data
useEffect(() => {
  async function loadTransactions() {
    const data = await getTreasuryTransactions();
    setTransactions(data);
    
    const summary = await getTreasurySummary();
    // Update stats
  }
  loadTransactions();
}, []);
```

## Benefits of This Approach

### 1. **Separation of Concerns**
- Auto-écoles manage their candidate invoices independently
- AutoEcoli admin tracks platform-wide revenue
- Clear distinction between platform and school finances

### 2. **Scalability**
- Easy to add new payment types
- Can track multiple revenue streams
- Supports future business models

### 3. **Reporting & Analytics**
- Generate platform-wide financial reports
- Track revenue by category, time period, auto-école
- Monitor payment trends and cash flow

### 4. **Audit & Compliance**
- Complete transaction history
- Timestamp tracking for all changes
- User attribution (who created/modified)

### 5. **Flexibility**
- Can implement different commission models per auto-école
- Support various payment methods
- Handle complex billing scenarios

## Next Steps

1. ✅ **Treasury service created** (`treasury.ts`)
2. 📝 **Update caisse page** to use Firebase treasury service
3. 📝 **Create payment middleware** for auto-école payments
4. 📝 **Implement commission tracking** on candidate payments
5. 📝 **Add automated treasury recording** when invoices are paid
6. 📝 **Create admin dashboard** for treasury analytics
7. 📝 **Set up payment notifications** for low balance alerts
8. 📝 **Implement export functionality** (PDF, Excel) for reports

## Security Considerations

- ✅ Only superadmin should access `Admin/tresorie`
- ✅ Implement Firestore security rules to protect treasury data
- ✅ Log all treasury modifications with user attribution
- ✅ Implement approval workflow for large transactions
- ✅ Set up alerts for suspicious activities

## Firestore Security Rules (Recommended)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admin collection - only superadmin
    match /Admin/{document=**} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/Admin/$(request.auth.uid)).data.role == 'superadmin';
    }
    
    // Treasury specifically
    match /Admin/tresorie/{document=**} {
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/Admin/$(request.auth.uid)).data.role == 'superadmin';
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/Admin/$(request.auth.uid)).data.role == 'superadmin';
    }
  }
}
```

## Summary

The treasury system is now ready to track all AutoEcoli platform financial transactions. The recommended approach is to:

1. Keep auto-école invoices separate (they manage their own candidate billing)
2. Record platform revenue (subscriptions, commissions, fees) in central treasury
3. Automate treasury recording when auto-écoles pay their platform fees
4. Implement commission tracking on candidate payments based on auto-école pack/agreement

This creates a clear, scalable, and audit-friendly financial management system.
