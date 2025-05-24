// Define all possible roles in the system
export type AdminRole = 'contentAdmin' | 'financialAdmin' | 'technicalAdmin';
export type UserRole = 'artist' | 'listener' | 'licensee' | AdminRole;

// Define permissions for each role
export const rolePermissions = {
  // Admin roles
  contentAdmin: [
    'verifyArtists', 
    'approveTracks', 
    'reviewMetadata'
  ],
  
  financialAdmin: [
    'verifyPayments',           // General permission to verify any payment
    'verifyCopyrightPayments',  // Verify copyright registration payments
    'verifyTransferPayments',   // Verify ownership transfer payments
    'verifyLicensePayments',    // Verify license payments
    'generateReports',          // Generate financial reports
    'handleDisputes',           // Handle payment disputes
    'viewTransactionHistory'    // View transaction history
  ],
  
  technicalAdmin: [
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
  
  // User roles
  artist: [
    'uploadTracks',
    'manageCopyrights',
    'viewRoyalties',
    'transferOwnership',
    'setLicenseTerms',
    'viewAnalytics'
  ],
  
  licensee: [
    'requestLicenses',
    'manageLicenses',
    'viewLicensedContent',
    'downloadLicensedContent',
    'reportUsage'
  ],
  
  listener: [
    'browseContent',
    'verifyTracks',
    'viewPublicInfo'
  ]
};

// User interface with roles
export interface User {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
}
