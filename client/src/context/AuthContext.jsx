import { createContext, useContext, useMemo, useState } from "react";

/* eslint-disable react-refresh/only-export-components */
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("quickcargo_token"));
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("quickcargo_user") || "null")
  );

  const login = (nextToken, nextUser) => {
    localStorage.setItem("quickcargo_token", nextToken);
    localStorage.setItem("quickcargo_user", JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  };

  const logout = () => {
    localStorage.removeItem("quickcargo_token");
    localStorage.removeItem("quickcargo_user");
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
