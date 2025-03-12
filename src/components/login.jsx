import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Form } from "react-router-dom";
import { api } from "../core/api";
import Button from "./button";

const Login = ({ swap }) => {
  const { logIn } = useContext(AuthContext);

  const [loginDetails, setLoginDetails] = useState({
    username: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginDetails((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const addBearerToken = (token) => {
    if (!token) {
      console.log("Token can't be undefined or null!");
      return;
    }
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  };

  const handleLogIn = async () => {
    const username =
      loginDetails?.username[0]?.toUpperCase() + loginDetails?.username?.slice(1).toLowerCase();
    setIsSubmitting(true);
    await api
      .post("/login", { username, password: loginDetails?.password })
      .then((res) => {
        const token = res.data.auth.token;
        const admin = res.data.auth.admin;
        localStorage.setItem("token", token);
        logIn(username, admin);
        addBearerToken(token);
      })
      .catch((err) => console.log(`Invalid credentials - ${err}`));
    setIsSubmitting(false);
    swap();
  };

  return (
    <div className="bg-black/70 w-[80%] sm:w-full min-h-screen flex flex-col items-center rounded-md shadow-lg shadow-red-600 text-red-600 my-20 sm:my-0 p-10 [&>*]:my-5 [&>*]:rounded-md [&>*]:p-5">
      <div className="w-[50rem]">
        <Form className="flex flex-col items-center p-10 bg-black mt-20 [&>*]:my-5 text-red-600 rounded-md shadow-md shadow-red-600">
          <div className="w-full flex justify-between">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={loginDetails.username}
              onChange={handleChange}
              className="bg-transparent rounded-md border border-red-500/20 shadow-md shadow-red-800/50 focus:shadow-red-600 focus:outline-none"
            />
          </div>
          <div className="w-full flex justify-between">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={loginDetails.password}
              onChange={handleChange}
              className="bg-transparent rounded-md border border-red-500/20 shadow-md shadow-red-800/50 focus:shadow-red-600 focus:outline-none"
            />
          </div>
          <Button
            msg={isSubmitting ? "Logging in..." : "Log In"}
            click={handleLogIn}
            disabled={isSubmitting || (!loginDetails.username && !loginDetails.password)}
            classes={
              (isSubmitting || (!loginDetails.username && !loginDetails.password)) &&
              "cursor-not-allowed opacity-50"
            }
          />
          <p className="underline hover:cursor-pointer" onClick={swap}>
            New user? Click here to create a new account.
          </p>
        </Form>
      </div>
    </div>
  );
};

export default Login;
