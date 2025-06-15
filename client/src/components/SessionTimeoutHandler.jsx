import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const SessionTimeoutHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleSessionTimeout = () => {
      // Only navigate if we're not already on the login page
      if (location.pathname !== "/") {
        navigate("/", { replace: true });
      }
    };

    window.addEventListener("auth:sessionTimeout", handleSessionTimeout);

    return () => {
      window.removeEventListener("auth:sessionTimeout", handleSessionTimeout);
    };
  }, [navigate, location]);

  return null;
};

export default SessionTimeoutHandler;
