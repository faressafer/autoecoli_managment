export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  autoEcoleId?: string;
  role: 'admin' | 'instructor' | 'candidate';
  createdAt: Date;
  updatedAt: Date;
}

export interface SidebarPermissions {
  dashboard: boolean;
  candidats: boolean;
  moniteurs: boolean;
  rendezvous: boolean;
  facturation: boolean;
  factureB: boolean;
  offres: boolean;
  billing: boolean;
  settings: boolean;
}

export interface AutoEcole {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  pack?: 'bronze' | 'silver' | 'gold' | null;
  packPaid?: boolean;
  paymentMethod?: 'D17' | 'Sur place';
  paymentRequestDate?: any;
  paymentStatus?: 'pending' | 'approved' | 'rejected';
  paymentApprovedDate?: any;
  rejectionReason?: string;
  rejectionDate?: any;
  status?: 'active' | 'inactive' | 'pending';
  sidebarPermissions?: SidebarPermissions;
  createdAt: Date;
  updatedAt: Date;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'Nouveau' | 'En cours' | 'Terminé';
  progress: number;
  lessons: number;
  autoEcoleId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Instructor {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization?: string;
  rating?: number;
  autoEcoleId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Offer {
  id: string;
  name: string;
  price: number;
  description?: string;
  lessons?: number;
  autoEcoleId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  invoiceId: string;
  candidateId: string;
  amount: number;
  date: Date;
  method: 'cash' | 'card' | 'bank' | 'other';
}

export interface Invoice {
  id: string;
  candidateId: string;
  candidateName?: string;
  candidateEmail?: string;
  candidatePhone?: string;
  offerId: string;
  offerName: string;
  totalPrice: number;
  status: 'En attente' | 'Payée partiellement' | 'Payée';
  payments: Payment[];
  paidAmount: number;
  remainingAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  autoEcoleId: string;
  autoEcoleName: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'payment' | 'pack' | 'general';
  title: string;
  message: string;
  read: boolean;
  createdAt: any;
  metadata?: {
    packType?: string;
    amount?: number;
    [key: string]: any;
  };
}

export interface SupportRequest {
  id: string;
  fullName: string;
  email: string;
  subject: 'general' | 'technical' | 'partnership' | 'candidateSupport' | 'other';
  message: string;
  status: 'pending' | 'in-progress' | 'resolved';
  createdAt: any;
  language: 'fr' | 'ar';
}
