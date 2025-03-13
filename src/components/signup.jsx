import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Form } from "react-router-dom";
import { api } from "../core/api";
import UseInput from "../hooks/use-input";
import { useUpdate } from "../hooks/use-update";
import { FaArrowAltCircleDown, FaArrowAltCircleUp } from "react-icons/fa";
import Button from "./button";
import { MdAddCircle } from "react-icons/md";

const Signup = ({ swap, setNotification }) => {
  const {
    value: firstNameValue,
    isValid: firstNameIsValid,
    hasError: firstNameHasError,
    changeHandler: firstNameChangeHandler,
    blurHandler: firstNameBlurHandler,
    reset: firstNameReset,
  } = UseInput((value) => /^[a-zA-Z]+$/.test(value) && value.length >= 2 && value.length <= 30);

  const {
    value: lastNameValue,
    isValid: lastNameIsValid,
    hasError: lastNameHasError,
    changeHandler: lastNameChangeHandler,
    blurHandler: lastNameBlurHandler,
    reset: lastNameReset,
  } = UseInput((value) => /^[a-zA-Z]+$/.test(value) && value.length >= 2 && value.length <= 30);

  const {
    value: usernameValue,
    isValid: usernameIsValid,
    hasError: usernameHasError,
    changeHandler: usernameChangeHandler,
    blurHandler: usernameBlurHandler,
    reset: usernameReset,
  } = UseInput(
    (value) =>
      value.length >= 6 &&
      value.length <= 16 &&
      /[A-Z]/.test(value) &&
      /[a-z]/.test(value) &&
      /[0-9]/.test(value) &&
      /^[A-Za-z0-9]+$/.test(value)
  );

  const {
    value: passwordValue,
    isValid: passwordIsValid,
    hasError: passwordHasError,
    changeHandler: passwordChangeHandler,
    blurHandler: passwordBlurHandler,
    reset: passwordReset,
  } = UseInput(
    (value) =>
      value.length >= 8 &&
      value.length <= 16 &&
      /[A-Z]/.test(value) &&
      /[a-z]/.test(value) &&
      /[0-9]/.test(value) &&
      /[$&+,:;=?@#|'"<>.⌃*()%!-_]/.test(value)
  );

  const {
    value: streetValue,
    isValid: streetIsValid,
    hasError: streetHasError,
    changeHandler: streetChangeHandler,
    blurHandler: streetBlurHandler,
    reset: streetReset,
  } = UseInput(
    (value) => /^[a-zA-Z\s0-9\.]+$/.test(value) && value.length >= 2 && value.length <= 30
  );

  const {
    value: postcodeValue,
    isValid: postcodeIsValid,
    hasError: postcodeHasError,
    changeHandler: postcodeChangeHandler,
    blurHandler: postcodeBlurHandler,
    reset: postcodeReset,
  } = UseInput((value) => /^[a-zA-Z0-9\s]+$/.test(value) && value.length >= 4 && value.length <= 6);

  const {
    value: townValue,
    isValid: townIsValid,
    hasError: townHasError,
    changeHandler: townChangeHandler,
    blurHandler: townBlurHandler,
    reset: townReset,
  } = UseInput((value) => /^[a-zA-Z\s]+$/.test(value) && value.length >= 2 && value.length <= 30);

  const {
    value: emailValue,
    isValid: emailIsValid,
    hasError: emailHasError,
    changeHandler: emailChangeHandler,
    blurHandler: emailBlurHandler,
    reset: emailReset,
  } = UseInput(
    (value) =>
      /[\w._%+-]+@[\w.-]+\.[a-zA-Z]{2,4}/.test(value) && value.length >= 5 && value.length <= 30
  );

  const {
    value: phoneValue,
    isValid: phoneIsValid,
    hasError: phoneHasError,
    changeHandler: phoneChangeHandler,
    blurHandler: phoneBlurHandler,
    reset: phoneReset,
  } = UseInput((value) => /^[0-9\s]+$/.test(value) && value.length >= 8 && value.length <= 12);

  const { logIn } = useContext(AuthContext);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rules, setRules] = useState(false);

  const resetData = (msg) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(false);
    }, 3000);
  };

  const { refetch } = useUpdate("/users");

  const addBearerToken = (token) => {
    if (!token) {
      console.log("Token can't be undefined or null.");
      return;
    }
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  };

  const resetForm = () => {
    firstNameReset();
    lastNameReset();
    usernameReset();
    passwordReset();
    streetReset();
    postcodeReset();
    townReset();
    emailReset();
    phoneReset();
  };

  const createNewUser = async () => {
    const firstName = firstNameValue[0]?.toUpperCase() + firstNameValue?.slice(1).toLowerCase();
    const lastName = lastNameValue[0]?.toUpperCase() + lastNameValue?.slice(1).toLowerCase();
    const username = usernameValue[0]?.toUpperCase() + usernameValue?.slice(1).toLowerCase();

    const postReqPayload = {
      firstName,
      lastName,
      username,
      password: passwordValue,
      street: streetValue,
      postcode: String(postcodeValue),
      town: townValue,
      email: emailValue,
      phone: String(phoneValue),
    };
    setIsSubmitting(true);
    await api
      .post("/signup", postReqPayload)
      .then(async (res) => {
        await refetch();
        const token = res.data.auth.token;
        const admin = res.data.auth.admin;
        localStorage.setItem("token", token);
        logIn(username, admin);
        addBearerToken(token);
        resetForm();
        resetData(
          <>
            <MdAddCircle />
            <span>Account created successfully!</span>
          </>
        );
      })
      .catch((err) => {
        console.log(`Post req - ${err}`);
        resetForm();
        resetData(
          <>
            <MdError />
            <span>Account creation failed!</span>
          </>
        );
      });
    setIsSubmitting(false);
    swap();
  };

  const validForm =
    firstNameIsValid &&
    lastNameIsValid &&
    usernameIsValid &&
    passwordIsValid &&
    streetIsValid &&
    postcodeIsValid &&
    townIsValid &&
    emailIsValid &&
    phoneIsValid;

  return (
    <div className="bg-black/70 w-[80%] sm:w-full min-h-screen flex flex-col items-center rounded-md shadow-lg shadow-red-600 text-red-600 my-20 sm:my-0 p-10 [&>*]:my-5 [&>*]:rounded-md [&>*]:p-5">
      <div className="w-[50rem] flex flex-col items-center p-10 bg-black mt-20 [&>*]:my-5 text-red-600 rounded-md shadow-md shadow-red-600">
        <Form className="flex flex-col [&>*]:my-5 text-red-600">
          <div className="flex flex-col">
            <h2 className="flex self-center items-center [&>*]:mx-2">
              <span>Validation rules: {rules ? "(Hide)" : "(Show)"}</span>
              {rules ? (
                <FaArrowAltCircleUp
                  className="animate-pulse hover:cursor-pointer"
                  onClick={() => setRules(false)}
                />
              ) : (
                <FaArrowAltCircleDown
                  className="animate-bounce hover:cursor-pointer"
                  onClick={() => setRules(true)}
                />
              )}
            </h2>
            {rules && (
              <>
                <p>First/last name: only letters allowed. 2-30 characters each</p>
                <p>
                  Username: must have at least one uppercase and lowercase character, and a number.
                  6-16 characters
                </p>
                <p>
                  Password: must have at least one uppercase and lowercase, character, number, and a
                  special character. 8-16 characters
                </p>
                <p>Street: only letters, spaces and dots. 2-30 characters</p>
                <p>Postcode: only letters, numbers and spaces. 4-6 characters</p>
                <p>Town: only letters and spaces. 2-30 characters</p>
                <p>E-mail: only valid e-mails. 5-30 characters</p>
                <p>Phone: only valid phone numbers. 8-12 characters</p>
              </>
            )}
          </div>
          <div className="flex justify-between">
            <label htmlFor="firstName">First name:</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={firstNameValue}
              onChange={firstNameChangeHandler}
              onBlur={firstNameBlurHandler}
              className={`bg-transparent rounded-md border border-red-500/20 shadow-md shadow-red-800/50 focus:shadow-red-600 focus:outline-none ${
                firstNameHasError && "animate-pulse !border-red-500"
              }`}
            />
          </div>
          <div className="flex justify-between">
            <label htmlFor="lastName">Last name:</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={lastNameValue}
              onChange={lastNameChangeHandler}
              onBlur={lastNameBlurHandler}
              className={`bg-transparent rounded-md border border-red-500/20 shadow-md shadow-red-800/50 focus:shadow-red-600 focus:outline-none ${
                lastNameHasError && "animate-pulse !border-red-500"
              }`}
            />
          </div>
          <div className="flex justify-between">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={usernameValue}
              onChange={usernameChangeHandler}
              onBlur={usernameBlurHandler}
              className={`bg-transparent rounded-md border border-red-500/20 shadow-md shadow-red-800/50 focus:shadow-red-600 focus:outline-none ${
                usernameHasError && "animate-pulse !border-red-500"
              }`}
            />
          </div>
          <div className="flex justify-between">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={passwordValue}
              onChange={passwordChangeHandler}
              onBlur={passwordBlurHandler}
              className={`bg-transparent rounded-md border border-red-500/20 shadow-md shadow-red-800/50 focus:shadow-red-600 focus:outline-none ${
                passwordHasError && "animate-pulse !border-red-500"
              }`}
            />
          </div>
          <div className="flex justify-between">
            <label htmlFor="street">Street:</label>
            <input
              type="text"
              id="street"
              name="street"
              value={streetValue}
              onChange={streetChangeHandler}
              onBlur={streetBlurHandler}
              className={`bg-transparent rounded-md border border-red-500/20 shadow-md shadow-red-800/50 focus:shadow-red-600 focus:outline-none ${
                streetHasError && "animate-pulse !border-red-500"
              }`}
            />
          </div>
          <div className="flex justify-between">
            <label htmlFor="postcode">Postcode:</label>
            <input
              type="text"
              id="postcode"
              name="postcode"
              value={postcodeValue}
              onChange={postcodeChangeHandler}
              onBlur={postcodeBlurHandler}
              className={`bg-transparent rounded-md border border-red-500/20 shadow-md shadow-red-800/50 focus:shadow-red-600 focus:outline-none ${
                postcodeHasError && "animate-pulse !border-red-500"
              }`}
            />
          </div>
          <div className="flex justify-between">
            <label htmlFor="town">Town:</label>
            <input
              type="text"
              id="town"
              name="town"
              value={townValue}
              onChange={townChangeHandler}
              onBlur={townBlurHandler}
              className={`bg-transparent rounded-md border border-red-500/20 shadow-md shadow-red-800/50 focus:shadow-red-600 focus:outline-none ${
                townHasError && "animate-pulse !border-red-500"
              }`}
            />
          </div>
          <div className="flex justify-between">
            <label htmlFor="email">E-mail:</label>
            <input
              type="text"
              id="email"
              name="email"
              value={emailValue}
              onChange={emailChangeHandler}
              onBlur={emailBlurHandler}
              className={`bg-transparent rounded-md border border-red-500/20 shadow-md shadow-red-800/50 focus:shadow-red-600 focus:outline-none ${
                emailHasError && "animate-pulse !border-red-500"
              }`}
            />
          </div>
          <div className="flex justify-between">
            <label htmlFor="phone">Phone:</label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={phoneValue}
              onChange={phoneChangeHandler}
              onBlur={phoneBlurHandler}
              className={`bg-transparent rounded-md border border-red-500/20 shadow-md shadow-red-800/50 focus:shadow-red-600 focus:outline-none ${
                phoneHasError && "animate-pulse !border-red-500"
              }`}
            />
          </div>
          <Button
            msg={isSubmitting ? "Signing up..." : "Sign Up"}
            click={createNewUser}
            disabled={!validForm || isSubmitting}
            classes={`${
              (!validForm || isSubmitting) && "cursor-not-allowed opacity-50"
            } self-center`}
          />
          <p className="underline hover:cursor-pointer" onClick={swap}>
            Already have an account? Click here to log in.
          </p>
        </Form>
      </div>
    </div>
  );
};

export default Signup;
