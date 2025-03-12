import React, { useContext, useState } from "react";
import { NavLink } from "react-router-dom";
import { FaUserLargeSlash, FaUserLarge, FaUserShield } from "react-icons/fa6";
import { FaCartPlus } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";
import { AuthContext } from "../context/authContext";

const MainNavigation = () => {
  const { curUser, admin } = useContext(AuthContext);

  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="w-full bg-black/50 sm:bg-black text-red-500 shadow-lg shadow-red-700/30 my-2 flex justify-center items-center">
      <nav className="w-3/4 flex sm:hidden justify-around items-center my-5">
        <NavLink
          className={({ isActive }) => (isActive ? "underline text-red-200" : "text-red-500")}
          to="/">
          Intro
        </NavLink>
        <NavLink
          className={({ isActive }) => (isActive ? "underline text-red-200" : "text-red-500")}
          to="products">
          Products
        </NavLink>
        <NavLink
          className={({ isActive }) => (isActive ? "underline text-red-200" : "text-red-500")}
          to="blog">
          Blog
        </NavLink>
        <NavLink
          className={({ isActive }) => (isActive ? "underline text-red-200" : "text-red-500")}
          to="reviews">
          Reviews
        </NavLink>
        <NavLink
          className={({ isActive }) => (isActive ? "underline text-red-200" : "text-red-500")}
          to="contact">
          Contact
        </NavLink>
        <NavLink
          className={({ isActive }) => (isActive ? "underline text-red-200" : "text-red-500")}
          to="auth">
          <div className="flex items-center [&>*]:mx-2">
            {curUser ? admin === "true" ? <FaUserShield /> : <FaUserLarge /> : <FaUserLargeSlash />}{" "}
            <div className="text-[1.5rem]">{curUser || "No user"} </div>
          </div>
        </NavLink>
        <NavLink
          className={({ isActive }) => (isActive ? "underline text-red-200" : "text-red-500")}
          to="cart">
          <FaCartPlus />
        </NavLink>
      </nav>
      <nav className="w-3/4 hidden sm:flex justify-around my-5">
        <div className="relative">
          <GiHamburgerMenu
            className="hover:cursor-pointer"
            onClick={() => setShowMenu(!showMenu)}
          />
          {showMenu && (
            <div className="absolute top-full left-[-5rem] mt-2 bg-black flex flex-col [&>*]:my-2 px-20 z-50 shadow-md shadow-red-800/50 rounded-md">
              <NavLink
                className={({ isActive }) =>
                  isActive ? "underline text-red-200 pt-5" : "text-red-500 pt-5"
                }
                to="/"
                onClick={() => setShowMenu(false)}>
                Intro
              </NavLink>
              <NavLink
                className={({ isActive }) => (isActive ? "underline text-red-200" : "text-red-500")}
                to="products"
                onClick={() => setShowMenu(false)}>
                Products
              </NavLink>
              <NavLink
                className={({ isActive }) => (isActive ? "underline text-red-200" : "text-red-500")}
                to="blog"
                onClick={() => setShowMenu(false)}>
                Blog
              </NavLink>
              <NavLink
                className={({ isActive }) => (isActive ? "underline text-red-200" : "text-red-500")}
                to="reviews"
                onClick={() => setShowMenu(false)}>
                Reviews
              </NavLink>
              <NavLink
                className={({ isActive }) => (isActive ? "underline text-red-200" : "text-red-500")}
                to="contact"
                onClick={() => setShowMenu(false)}>
                Contact
              </NavLink>
            </div>
          )}
        </div>
        <NavLink
          className={({ isActive }) => (isActive ? "underline text-red-200" : "text-red-500")}
          to="auth">
          <div className="flex items-center [&>*]:mx-2">
            {curUser ? admin === "true" ? <FaUserShield /> : <FaUserLarge /> : <FaUserLargeSlash />}{" "}
            <div className="text-[1.5rem]">{curUser || "No user"} </div>
          </div>
        </NavLink>
        <NavLink
          className={({ isActive }) => (isActive ? "underline text-red-200" : "text-red-500")}
          to="cart">
          <FaCartPlus />
        </NavLink>
      </nav>
    </div>
  );
};

export default MainNavigation;
