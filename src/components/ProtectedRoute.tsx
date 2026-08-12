import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles?: string[];
};

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: {
            pathname: location.pathname,
            search: location.search,
          },
        }}
      />
    );
  }

  if (allowedRoles?.length) {
    const userRole = user.role.toUpperCase();

    const hasRequiredRole = allowedRoles.some(
      (role) => role.toUpperCase() === userRole,
    );

    if (!hasRequiredRole) {
      return (
        <Navigate
          to="/unauthorized"
          replace
          state={{
            attemptedPath: location.pathname,
          }}
        />
      );
    }
  }

  return <>{children}</>;
}
