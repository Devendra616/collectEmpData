import { createContext, useContext, useState, useEffect } from "react";
import { useFormData } from "./FormContext";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(
    localStorage.getItem("token") ? localStorage.getItem("token") : null
  );
  const [user, setUser] = useState(
    localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user"))
      : null
  );

  const [empData, setEmpData] = useState(() => {
    const stored = sessionStorage.getItem("empData");
    return stored ? JSON.parse(stored) : "";
  });

  const { dispatch: formDispatch } = useFormData();

  // Add token validation effect
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
          console.log("session expired");
          toast.error("Session invalid or expired.");
          throw new Error("Token invalid or expired");
        }
      } catch (error) {
        console.error("Token validation failed:", error);
        toast.error("Session invalid or expired.");
        handleSessionTimeout();
      }
    };

    validateToken();
  }, [token]);

  const handleSessionTimeout = () => {
    logout();
    // Instead of using navigate directly, we'll dispatch a custom event
    window.dispatchEvent(new CustomEvent("auth:sessionTimeout"));
  };

  const login = (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setToken(token);
    setUser(user);
  };
  // console.log("🚀 ~ login ~ token:", token)

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("empData");
    formDispatch({ type: "CLEAR_FORM_DATA" }); // This will handle both state reset and localStorage clearing
    setToken(null);
    setUser(null);
    setEmpData("");
  };

  const fetchData = (result) => {
    setEmpData(result);
    sessionStorage.setItem("empData", JSON.stringify(result));
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        isAuthenticated,
        fetchData,
        empData,
        handleSessionTimeout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
