import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const [empData, setEmpData] = useState(()=>{
    const stored = sessionStorage.getItem("empData");
    return stored? JSON.parse(stored): "";
  })

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
    setToken(null);
    setUser(null);
    setEmpData("");
  };

  const fetchData =(result) =>{
    setEmpData(result);
    sessionStorage.setItem("empData", JSON.stringify(result));
  }

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{token,user, login, logout, isAuthenticated, fetchData, empData}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
