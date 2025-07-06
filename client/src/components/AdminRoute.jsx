import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

const AdminRoute = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateAdminToken = async () => {
      const adminToken = sessionStorage.getItem("adminToken");

      if (!adminToken) {
        setIsAdminAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("/admin/validate-token", {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        });

        if (response.ok) {
          setIsAdminAuthenticated(true);
        } else {
          // Clear invalid admin session
          sessionStorage.removeItem("adminToken");
          sessionStorage.removeItem("adminUser");
          setIsAdminAuthenticated(false);
        }
      } catch (error) {
        console.error("Admin token validation failed:", error);
        // Clear invalid admin session
        sessionStorage.removeItem("adminToken");
        sessionStorage.removeItem("adminUser");
        setIsAdminAuthenticated(false);
      }

      setIsLoading(false);
    };

    validateAdminToken();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" />;
  }

  return children;
};

export default AdminRoute;
