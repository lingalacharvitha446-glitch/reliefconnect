import { Navigate } from "react-router-dom";
import { getCurrentUser } from "../utils/auth";

function ProtectedRoute({
  children,
  allowedRole,
}) {

  const user = getCurrentUser();


  /* NOT LOGGED IN */

  if (!user) {
    return <Navigate to="/login" replace />;
  }


  /* WRONG ROLE */

  if (
    allowedRole &&
    user.role !== allowedRole
  ) {
    return <Navigate to="/login" replace />;
  }


  return children;
}

export default ProtectedRoute;