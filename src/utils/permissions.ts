import type { User, UserRole, AdminType } from '../types/auth';
import { rolePermissions } from '../types/auth';

/**
 * Check if a user has permission for a specific action
 * @param user The user to check permissions for
 * @param action The action to check permission for
 * @returns Boolean indicating if the user has permission
 */
export function hasPermission(user: User | null, action: string): boolean {
  if (!user) return false;
  // Artists and licensees
  if (user.role === 'artist' || user.role === 'licensee') {
    return rolePermissions[user.role]?.includes(action);
  }
  // Admins
  if (user.role === 'admin' && user.adminType) {
    return rolePermissions[user.adminType]?.includes(action);
  }
  return false;
}

/**
 * Check if a user has a specific role
 * @param user The user to check
 * @param role The role to check for
 * @returns Boolean indicating if the user has the role
 */
export function hasRole(user: User | null, role: UserRole | AdminType): boolean {
  if (!user) return false;
  
  // Special case: if checking for 'admin' role, just check user.role
  if (role === 'admin') return user.role === 'admin';
  
  // For artist/licensee roles
  if (role === 'artist' || role === 'licensee') return user.role === role;
  
  // For specific admin types
  if (role === 'content' || role === 'financial' || role === 'technical' || role === 'super') {
    return user.role === 'admin' && user.adminType === role;
  }
  
  return false;
}

/**
 * Check if a user has any admin role
 * @param user The user to check
 * @returns Boolean indicating if the user has any admin role
 */
export function isAdmin(user: User | null): boolean {
  if (!user) return false;
  return user.role === 'admin';
}

/**
 * Get all permissions for a user based on their role/adminType
 * @param user The user to get permissions for
 * @returns Array of all permissions the user has
 */
export function getAllPermissions(user: User | null): string[] {
  if (!user) return [];
  if (user.role === 'artist' || user.role === 'licensee') {
    return rolePermissions[user.role] || [];
  }
  if (user.role === 'admin' && user.adminType) {
    return rolePermissions[user.adminType] || [];
  }
  return [];
}
