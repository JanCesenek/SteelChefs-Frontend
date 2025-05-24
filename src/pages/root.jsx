import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import MainNavigation from "../components/mainNavigation";
import { v4 as uuid } from "uuid";
import { getTokenExpiry } from "../../utils/token";
import { api } from "../core/api";
import { FaCopyright } from "react-icons/fa";
import logo from "/flamebulb.svg";
import { ToastContainer, Flip } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RootLayout = () => {
  const uniqueID = localStorage.getItem("uniqueID");

  const token = localStorage.getItem("token");

  const removeBearerToken = () => {
    delete api.defaults.headers.common["Authorization"];
  };

  useEffect(() => {
    if (!uniqueID) {
      const specialID = uuid();
      localStorage.setItem("uniqueID", specialID);
    }
    if (token) {
      const expiryTimeInSeconds = getTokenExpiry(token);
      const expiryDate = new Date(expiryTimeInSeconds * 1000);
      if (expiryDate < Date.now()) {
        removeBearerToken();
        localStorage.removeItem("token");
        localStorage.removeItem("curUser");
        localStorage.removeItem("admin");
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-black/80 text-red-600">
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Flip}
        style={{ fontSize: "1.5rem" }}
      />
      <div className="w-full bg-black/40 shadow-lg shadow-red-600/30 flex justify-center items-center">
        <img
          src="https://jwylvnqdlbtbmxsencfu.supabase.co/storage/v1/object/public/steelchefs/staticImgs/SteelchefsLogoRed.png"
          alt="Steelchefs logo"
          className="max-w-[30rem] max-h-[30rem]"
        />
      </div>
      <MainNavigation />
      <Outlet />
      <div className="w-full h-[4rem] bg-black flex justify-center items-center text-[1.5rem] mt-20">
        <FaCopyright className=" mr-2" />
        <div className="flex items-center">
          <p className="mr-2">|</p>
          <img src={logo} alt="logo" className="w-[1.5rem]" />
          <p className="ml-2">Jan Cesenek 2025 | All rights reserved</p>
        </div>
      </div>
    </div>
  );
};

export default RootLayout;
