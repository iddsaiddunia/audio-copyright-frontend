import type { User, AdminRole, UserRole } from '../types/auth';
import { rolePermissions } from '../types/auth';

/**
 * Check if a user has permission for a specific action
 * @param user The user to check permissions for
 * @param action The action to check permission for
 * @returns Boolean indicating if the user has permission
 */
export function hasPermission(user: User | null, action: string): boolean {
  if (!user) return false;
  
  return user.roles.some(role => 
    rolePermissions[role as keyof typeof rolePermissions]?.includes(action)
  );
}

/**
 * Check if a user has a specific role
 * @param user The user to check
 * @param role The role to check for
 * @returns Boolean indicating if the user has the role
 */
export function hasRole(user: User | null, role: UserRole): boolean {
  if (!user) return false;
  return user.roles.includes(role);
}

/**
 * Check if a user has any admin role
 * @param user The user to check
 * @returns Boolean indicating if the user has any admin role
 */
export function isAdmin(user: User | null): boolean {
  if (!user) return false;
  const adminRoles: AdminRole[] = ['contentAdmin', 'financialAdmin', 'technicalAdmin'];
  return user.roles.some(role => adminRoles.includes(role as AdminRole));
}

/**
 * Get all permissions for a user based on their roles
 * @param user The user to get permissions for
 * @returns Array of all permissions the user has
 */
export function getAllPermissions(user: User | null): string[] {
  if (!user) return [];
  
  return user.roles.reduce((permissions: string[], role) => {
    const rolePerms = rolePermissions[role as keyof typeof rolePermissions] || [];
    return [...permissions, ...rolePerms];
  }, []);
}
