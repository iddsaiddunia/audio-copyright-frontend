import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';


interface ProtectedRouteProps {
  requiredRole: string | string[];
  requiredPermission?: string;
}

/**
 * A component that protects routes based on user roles or permissions
 * If no specific role or permission is required, it just checks if the user is logged in
 */
function ProtectedRoute({ requiredRole, requiredPermission }: ProtectedRouteProps) {
  const { currentUser, isLoading, hasRole, hasPermission, isAdmin } = useAuth();
  const location = useLocation();
  
  // Show nothing while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <svg className="animate-spin h-10 w-10 text-cosota" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }
  
  // Allow requiredRole to be string or array
  const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  if (!currentUser || !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/auth/login" replace />;
  }
  
  // Debug logging for authentication checks
  console.debug('[ProtectedRoute] Auth check:', {
    path: location.pathname,
    user: currentUser,
    role: currentUser?.role,
    adminType: currentUser?.adminType,
    requiredRole,
    requiredPermission,
    isAdmin: isAdmin(),
  });

  // Special handling for admin routes
  if (location.pathname.startsWith('/admin')) {
    // For admin routes, check if user is any type of admin
    if (!isAdmin()) {
      console.debug('[ProtectedRoute] Redirecting to 404: Not an admin');
      return <Navigate to="/404" replace />;
    }
  } else if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!allowedRoles.some(hasRole)) {
      console.debug('[ProtectedRoute] Redirecting to 404: Missing required role', requiredRole);
      return <Navigate to="/404" replace />;
    }
  }
  
  // Check for required permission if specified
  if (requiredPermission && !hasPermission(requiredPermission)) {
    // For routes that need specific permissions, redirect to admin dashboard
    // if the user is an admin but lacks the specific permission
    if (isAdmin() && location.pathname.startsWith('/admin')) {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/404" replace />;
  }
  
  // If all checks pass, render the child routes
  return <Outlet />;
}

export default ProtectedRoute;
