export interface Payment {
  id: string;
  trackId: string;
  artistId: string;
  amount: number;
  paymentType: 'registration' | 'licensing' | 'transfer';
  status: 'initial' | 'pending' | 'approved' | 'rejected';
  controlNumber?: string;
  amountPaid?: number;
  paidAt?: string;
  expiry?: string;
  licenseId?: string;
  createdAt: string;
  updatedAt: string;
}
