import type { Track } from './track';
import type { User } from './user';
import type { Payment } from './payment';

export interface OwnershipTransfer {
  id: string;
  trackId: string;
  currentOwnerId: string;
  newOwnerId: string;
  status: 'requested' | 'approved' | 'published' | 'rejected';
  paymentId: string;
  requestedAt: string;
  publishedAt?: string;
  blockchainTx?: string;
  certificateUrl?: string;

  // Relations
  track?: Track;
  currentOwner?: User;
  newOwner?: User;
  payment?: Payment;

  // For UI purposes
  transferType?: 'incoming' | 'outgoing';
}
