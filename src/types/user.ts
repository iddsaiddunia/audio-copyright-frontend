export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  idNumber: string;
  role: 'admin' | 'artist' | 'licensee';
  adminType?: 'super' | 'content' | 'technical' | 'financial';
  isVerified: boolean;
  status: 'active' | 'inactive' | 'suspended';
  walletAddress?: string;
  createdAt: string;
  updatedAt: string;
  
  // Helper property for display
  fullName?: string;
}
