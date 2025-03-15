import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [curUser, setCurUser] = useState(localStorage.getItem("curUser"));
  const [admin, setAdmin] = useState(localStorage.getItem("admin"));
  const [productNumber, setProductNumber] = useState(0);

  useEffect(() => {
    const handleStorageChange = () => {
      setCurUser(localStorage.getItem("curUser"));
      setAdmin(localStorage.getItem("admin"));
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const logIn = (username, admin) => {
    localStorage.setItem("curUser", username);
    localStorage.setItem("admin", admin);
    setCurUser(username);
    setAdmin(admin);
  };

  const logOut = () => {
    localStorage.clear();
    setCurUser(null);
    setAdmin(null);
  };

  const updateProductNumber = (number) => {
    setProductNumber(number);
  };

  return (
    <AuthContext.Provider
      value={{ curUser, admin, logIn, logOut, productNumber, updateProductNumber }}>
      {children}
    </AuthContext.Provider>
  );
};
