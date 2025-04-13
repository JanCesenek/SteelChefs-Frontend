import React, { createContext, useState, useEffect } from "react";
import { toast, Flip } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Success from "../audio/Success.mp3";
import Error from "../audio/Error.mp3";

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

  const notifyContext = (msg, state) => {
    if (state === "success") {
      const audio = new Audio(Success);
      audio.play();
      toast.success(msg, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Flip,
      });
    } else if (state === "error") {
      const audio = new Audio(Error);
      audio.play();
      toast.error(msg, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Flip,
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{ curUser, admin, logIn, logOut, productNumber, updateProductNumber, notifyContext }}>
      {children}
    </AuthContext.Provider>
  );
};
