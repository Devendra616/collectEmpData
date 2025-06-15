import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, token, handleSessionTimeout } = useAuth();

  useEffect(() => {
    const validateToken = async () => {
      if (!token) return;

      try {
        const response = await fetch("/api/validate-token", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          handleSessionTimeout();
        }
      } catch (error) {
        console.error("Token validation failed:", error);
        handleSessionTimeout();
      }
    };

    validateToken();
  }, [token, handleSessionTimeout]);

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return children;
};

export default PrivateRoute;
