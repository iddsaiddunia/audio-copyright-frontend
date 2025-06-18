// Define all possible roles in the system
export type UserRole = 'artist' | 'licensee' | 'admin';
export type AdminType = 'content' | 'financial' | 'technical' | 'super';

// Define permissions for each role
export const rolePermissions = {
  // Admin roles
  content: [
    'verifyArtists', 
    'approveTracks', 
    'reviewMetadata'
  ],
  financial: [
    'verifyPayments',           // General permission to verify any payment
    'verifyCopyrightPayments',  // Verify copyright registration payments
    'verifyTransferPayments',   // Verify ownership transfer payments
    'verifyLicensePayments',    // Verify license payments
    'generateReports',          // Generate financial reports
    'handleDisputes',           // Handle payment disputes
    'viewTransactionHistory'    // View transaction history
  ],
  technical: [
    // Blockchain admin permissions
    'publishCopyrights', 
    'monitorTransactions', 
    'manageWallets',
    // System admin permissions
    'manageUsers',
    'configureSystem',
    'viewLogs',
    'manageRoles',
    'backupSystem'
  ],
  super: [
    // Super admin permissions (example)
    'allPermissions',
    'manageAdmins',
    'systemOverride',
    'viewAllReports',
    'configurePlatform',
  ],
  
  // User roles
  artist: [
    'uploadTracks',
    'manageCopyrights',
    'transferOwnership',
    'setLicenseTerms',
    'viewAnalytics',
    // Artists can also have licensee permissions
    'requestLicenses',
    'manageLicenses',
    'viewLicensedContent',
    'downloadLicensedContent',
    'reportUsage'
  ],
  
  licensee: [
    'requestLicenses',
    'manageLicenses',
    'viewLicensedContent',
    'downloadLicensedContent',
    'reportUsage'
  ]
  
  // Note: 'listener' role removed as it represents any non-registered user
  // Public permissions are handled separately in the backend
};

// User interface with roles
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  adminType?: AdminType;
  // Add artist verification fields
  isVerified?: boolean;
  status?: string;
}
