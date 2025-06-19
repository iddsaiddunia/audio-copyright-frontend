export interface Track {
  id: string;
  title: string;
  artistId: string;
  genre: string;
  releaseYear: string;
  licenseFee: number;
  artist?: User;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Payment {
  id: string;
  amount: number;
  status: string;
  paidAt?: string;
}

export interface License {
  id: string;
  trackId: string;
  requesterId: string;
  ownerId: string;
  purpose: string;
  duration: number;
  territory: string;
  usageType: string;
  licenseType: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid' | 'published';
  rejectionReason?: string;
  certificateUrl?: string;
  blockchainTx?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  track?: Track;
  requester?: User;
  owner?: User;
  payments?: Payment[];
}

export interface LicenseRequest {
  trackId: string;
  purpose: string;
  duration: number;
  territory: string;
  usageType: string;
}
