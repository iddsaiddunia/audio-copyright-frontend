// Using interfaces directly in this file to avoid circular dependencies
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'artist' | 'licensee';
}

export interface Payment {
  id: string;
  amount: number;
  status: string;
  paymentType: string;
}

export interface Track {
  id: string;
  title: string;
  artistId: string;
  filename: string;
  genre: string;
  releaseYear: string;
  description: string;
  lyrics: string;
  collaborators: string;
  isAvailableForLicensing: boolean;
  licenseFee: number;
  licenseTerms: string;
  duration?: number;
  fingerprint?: string;
  status: 'pending' | 'approved' | 'rejected' | 'copyrighted';
  rejectionReason?: string | null;
  blockchainTx?: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  artist?: User;
  payments?: Payment[];
  
  // Frontend-specific fields
  paymentStatus?: 'initial' | 'pending' | 'approved' | 'rejected' | 'verified';
}
