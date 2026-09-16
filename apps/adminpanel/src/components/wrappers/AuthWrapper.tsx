import useUser from "@/hooks/states/useUser";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";

type PrivateRouteProps = {
  roles?: string[];
  children: ReactNode;
};

const AuthWrapper: React.FC<PrivateRouteProps> = ({ roles = [], children }) => {
  const { user } = useUser();
  const location = useLocation();

  if (!user?.is_authenticated && !user?.info?._id) {
    return <Navigate to="/auth/signin" state={{ from: location }} replace />;
  }

  if (roles.length > 0 && !roles.includes(user.info?.role ?? "")) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AuthWrapper;
