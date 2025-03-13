import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Login from "../components/login";
import Signup from "../components/signup";
import { api } from "../core/api";
import { useUpdate } from "../hooks/use-update";
import { MdEditDocument, MdError } from "react-icons/md";
import { BsPencil } from "react-icons/bs";
import { FiLogOut } from "react-icons/fi";
import { ImCross } from "react-icons/im";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { FaArrowAltCircleDown, FaArrowAltCircleUp } from "react-icons/fa";
import Button from "../components/button";
import OrderDetail from "../components/orderDetail";
import Notification from "../components/notification";

const Auth = () => {
  const { data: usersData, refetch: refetchUsers } = useUpdate("/users");
  const { data: productsData, refetch: refetchProducts } = useUpdate("/products");
  const { data: unitsData, refetch: refetchUnits } = useUpdate("/ordered-units");
  const { data: ordersData, refetch: refetchOrders } = useUpdate("/orders");

  useEffect(() => {
    const fetchAll = async () => {
      await refetchUsers();
      await refetchProducts();
      await refetchUnits();
      await refetchOrders();
    };
    fetchAll();
  }, []);

  const { logOut } = useContext(AuthContext);

  const [newAccount, setNewAccount] = useState(false);
  const [notification, setNotification] = useState(false);
  const [personalDetails, setPersonalDetails] = useState(false);
  const [orders, setOrders] = useState(false);

  const [editState, setEditState] = useState({
    firstName: false,
    lastName: false,
    username: false,
    password: false,
    street: false,
    postcode: false,
    town: false,
    email: false,
    phone: false,
  });

  const curUser = localStorage.getItem("curUser");
  const token = localStorage.getItem("token");

  const loggedUser = usersData?.find((el) => curUser === el.username);

  useEffect(() => {
    if (loggedUser) {
      setFirstName(loggedUser.firstName);
      setLastName(loggedUser.lastName);
      setUsername(loggedUser.username);
      setPassword(loggedUser.password);
      setStreet(loggedUser.street);
      setPostcode(loggedUser.postcode);
      setTown(loggedUser.town);
      setEmail(loggedUser.email);
      setPhone(loggedUser.phone);
    }
  }, [loggedUser]);

  const userOrders = ordersData?.filter((el) => el.userID === loggedUser?.id);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [street, setStreet] = useState("");
  const [postcode, setPostcode] = useState("");
  const [town, setTown] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const resetAll = () => {
    setFirstName("");
    setLastName("");
    setUsername("");
    setPassword("");
    setStreet("");
    setPostcode("");
    setTown("");
    setEmail("");
    setPhone("");
  };

  const removeBearerToken = () => {
    delete api.defaults.headers.common["Authorization"];
  };

  const resetData = (msg) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(false);
    }, 3000);
  };

  const editDetails = async (data) => {
    await api
      .patch(`/users/${curUser}`, data, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      })
      .then(async () => {
        await refetchUsers();
        resetData(
          <>
            <MdEditDocument />
            <span>Details updated successfully!</span>
          </>
        );
        setEditState({
          firstName: false,
          lastName: false,
          username: false,
          password: false,
          street: false,
          postcode: false,
          town: false,
          email: false,
          phone: false,
        });
        resetAll();
      })
      .catch((err) => {
        console.log(`Patch req - ${err}`);
        resetData(
          <>
            <MdError />
            <span>Error updating details!</span>
          </>
        );
        setEditState({
          firstName: false,
          lastName: false,
          username: false,
          password: false,
          street: false,
          postcode: false,
          town: false,
          email: false,
          phone: false,
        });
        resetAll();
      });
  };

  const handleLogOut = () => {
    removeBearerToken();
    logOut();
    setNewAccount(!newAccount);
  };

  const deleteUser = async (e) => {
    if (window.confirm("Really wanna delete your account?")) {
      await api
        .delete(`/users/${curUser}`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        })
        .then(async () => {
          await refetch();
          removeBearerToken();
          localStorage.clear();
          setNewAccount(!newAccount);
        })
        .catch((err) => console.log(`Delete req - ${err}`));
    } else e.preventDefault();
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center">
      {notification && <Notification msg={notification} css="mt-20" />}
      {/* If a user is logged in */}
      {curUser ? (
        <div className="bg-black/70 w-[80%] sm:w-full min-h-screen flex flex-col items-center rounded-md shadow-lg shadow-red-600 text-red-600 my-20 sm:my-0 p-10 [&>*]:my-5 [&>*]:rounded-md [&>*]:p-5">
          {/* Toggle personal details */}
          {!orders &&
            (personalDetails ? (
              <button
                className="flex items-center [&>*]:mx-2 self-center"
                onClick={() => setPersonalDetails(false)}>
                <span>Hide personal details</span>
                <FaArrowAltCircleUp className="animate-pulse" />
              </button>
            ) : (
              <button
                className="flex items-center [&>*]:mx-2 self-center"
                onClick={() => setPersonalDetails(true)}>
                <span>Show personal details</span>
                <FaArrowAltCircleDown className="animate-pulse" />
              </button>
            ))}
          {/* Personal details */}
          {personalDetails && (
            <div className="flex flex-col [&>*]:my-1 bg-black shadow-lg shadow-red-800/50 rounded-md">
              <div className="flex items-center [&>*]:mx-2">
                <label className="min-w-[15rem]" htmlFor="firstName">
                  First name:
                </label>
                {editState.firstName ? (
                  <input
                    className="bg-transparent text-red-600 border border-red-600 rounded-md"
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                ) : (
                  <div>{loggedUser?.firstName}</div>
                )}
                {editState.firstName ? (
                  <span className="flex items-center [&>*]:mx-2">
                    <button onClick={() => editDetails({ firstName })}>Change</button>
                    <ImCross
                      className="hover:cursor-pointer w-5 h-5"
                      onClick={(prevState) => setEditState({ ...prevState, firstName: false })}
                    />
                  </span>
                ) : (
                  <BsPencil
                    className="hover:cursor-pointer w-5 h-5"
                    onClick={(prevState) => setEditState({ ...prevState, firstName: true })}
                  />
                )}
              </div>
              <div className="flex items-center [&>*]:mx-2">
                <label className="min-w-[15rem]" htmlFor="lastName">
                  Last name:
                </label>
                {editState.lastName ? (
                  <input
                    className="bg-transparent text-red-600 border border-red-600 rounded-md"
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                ) : (
                  <div>{loggedUser?.lastName}</div>
                )}
                {editState.lastName ? (
                  <span className="flex items-center [&>*]:mx-2">
                    <button onClick={() => editDetails({ lastName })}>Change</button>
                    <ImCross
                      className="hover:cursor-pointer w-5 h-5"
                      onClick={(prevState) => setEditState({ ...prevState, lastName: false })}
                    />
                  </span>
                ) : (
                  <BsPencil
                    className="hover:cursor-pointer w-5 h-5"
                    onClick={(prevState) => setEditState({ ...prevState, lastName: true })}
                  />
                )}
              </div>
              <div className="flex items-center [&>*]:mx-2">
                <label className="min-w-[15rem]" htmlFor="username">
                  Username:
                </label>
                {editState.username ? (
                  <input
                    className="bg-transparent text-red-600 border border-red-600 rounded-md"
                    type="text"
                    id="username"
                    name="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                ) : (
                  <div>{loggedUser?.username}</div>
                )}
                {editState.username ? (
                  <span className="flex items-center [&>*]:mx-2">
                    <button onClick={() => editDetails({ username })}>Change</button>
                    <ImCross
                      className="hover:cursor-pointer w-5 h-5"
                      onClick={(prevState) => setEditState({ ...prevState, username: false })}
                    />
                  </span>
                ) : (
                  <BsPencil
                    className="hover:cursor-pointer w-5 h-5"
                    onClick={(prevState) => setEditState({ ...prevState, username: true })}
                  />
                )}
              </div>
              <div className="flex items-center [&>*]:mx-2">
                <label className="min-w-[15rem]" htmlFor="password">
                  Password:
                </label>
                {editState.password ? (
                  <input
                    className="bg-transparent text-red-600 border border-red-600 rounded-md"
                    type="text"
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                ) : (
                  <div>********</div>
                )}
                {editState.password ? (
                  <span className="flex items-center [&>*]:mx-2">
                    <button onClick={() => editDetails({ password })}>Change</button>
                    <ImCross
                      className="hover:cursor-pointer w-5 h-5"
                      onClick={(prevState) => setEditState({ ...prevState, password: false })}
                    />
                  </span>
                ) : (
                  <BsPencil
                    className="hover:cursor-pointer w-5 h-5"
                    onClick={(prevState) => setEditState({ ...prevState, password: true })}
                  />
                )}
              </div>
              <div className="flex items-center [&>*]:mx-2">
                <label className="min-w-[15rem]" htmlFor="street">
                  Street:
                </label>
                {editState.street ? (
                  <input
                    className="bg-transparent text-red-600 border border-red-600 rounded-md"
                    type="text"
                    id="street"
                    name="street"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                  />
                ) : (
                  <div>{loggedUser?.street}</div>
                )}
                {editState.street ? (
                  <span className="flex items-center [&>*]:mx-2">
                    <button onClick={() => editDetails({ street })}>Change</button>
                    <ImCross
                      className="hover:cursor-pointer w-5 h-5"
                      onClick={(prevState) => setEditState({ ...prevState, street: false })}
                    />
                  </span>
                ) : (
                  <BsPencil
                    className="hover:cursor-pointer w-5 h-5"
                    onClick={(prevState) => setEditState({ ...prevState, street: true })}
                  />
                )}
              </div>
              <div className="flex items-center [&>*]:mx-2">
                <label className="min-w-[15rem]" htmlFor="postcode">
                  Postcode:
                </label>
                {editState.postcode ? (
                  <input
                    className="bg-transparent text-red-600 border border-red-600 rounded-md"
                    type="text"
                    id="postcode"
                    name="postcode"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                  />
                ) : (
                  <div>{loggedUser?.postcode}</div>
                )}
                {editState.postcode ? (
                  <span className="flex items-center [&>*]:mx-2">
                    <button onClick={() => editDetails({ postcode })}>Change</button>
                    <ImCross
                      className="hover:cursor-pointer w-5 h-5"
                      onClick={(prevState) => setEditState({ ...prevState, postcode: false })}
                    />
                  </span>
                ) : (
                  <BsPencil
                    className="hover:cursor-pointer w-5 h-5"
                    onClick={(prevState) => setEditState({ ...prevState, postcode: true })}
                  />
                )}
              </div>
              <div className="flex items-center [&>*]:mx-2">
                <label className="min-w-[15rem]" htmlFor="town">
                  Town:
                </label>
                {editState.town ? (
                  <input
                    className="bg-transparent text-red-600 border border-red-600 rounded-md"
                    type="text"
                    id="town"
                    name="town"
                    value={town}
                    onChange={(e) => setTown(e.target.value)}
                  />
                ) : (
                  <div>{loggedUser?.town}</div>
                )}
                {editState.town ? (
                  <span className="flex items-center [&>*]:mx-2">
                    <button onClick={() => editDetails({ town })}>Change</button>
                    <ImCross
                      className="hover:cursor-pointer w-5 h-5"
                      onClick={(prevState) => setEditState({ ...prevState, town: false })}
                    />
                  </span>
                ) : (
                  <BsPencil
                    className="hover:cursor-pointer w-5 h-5"
                    onClick={(prevState) => setEditState({ ...prevState, town: true })}
                  />
                )}
              </div>
              <div className="flex items-center [&>*]:mx-2">
                <label className="min-w-[15rem]" htmlFor="email">
                  E-mail:
                </label>
                {editState.email ? (
                  <input
                    className="bg-transparent text-red-600 border border-red-600 rounded-md"
                    type="text"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                ) : (
                  <div>{loggedUser?.email}</div>
                )}
                {editState.email ? (
                  <span className="flex items-center [&>*]:mx-2">
                    <button onClick={() => editDetails({ email })}>Change</button>
                    <ImCross
                      className="hover:cursor-pointer w-5 h-5"
                      onClick={(prevState) => setEditState({ ...prevState, email: false })}
                    />
                  </span>
                ) : (
                  <BsPencil
                    className="hover:cursor-pointer w-5 h-5"
                    onClick={(prevState) => setEditState({ ...prevState, email: true })}
                  />
                )}
              </div>
              <div className="flex items-center [&>*]:mx-2">
                <label className="min-w-[15rem]" htmlFor="phone">
                  Phone:
                </label>
                {editState.phone ? (
                  <input
                    className="bg-transparent text-red-600 border border-red-600 rounded-md"
                    type="text"
                    id="phone"
                    name="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                ) : (
                  <div>{loggedUser?.phone}</div>
                )}
                {editState.phone ? (
                  <span className="flex items-center [&>*]:mx-2">
                    <button onClick={() => editDetails({ phone })}>Change</button>
                    <ImCross
                      className="hover:cursor-pointer w-5 h-5"
                      onClick={(prevState) => setEditState({ ...prevState, phone: false })}
                    />
                  </span>
                ) : (
                  <BsPencil
                    className="hover:cursor-pointer w-5 h-5"
                    onClick={(prevState) => setEditState({ ...prevState, phone: true })}
                  />
                )}
              </div>
            </div>
          )}
          {/* Toggle orders */}
          {!personalDetails &&
            (orders ? (
              <button
                className="flex items-center [&>*]:mx-2 self-center"
                onClick={() => setOrders(false)}>
                <span>Hide orders</span>
                <FaArrowAltCircleUp className="animate-pulse" />
              </button>
            ) : (
              <button
                className="flex items-center [&>*]:mx-2 self-center"
                onClick={() => setOrders(true)}>
                <span>Show orders</span>
                <FaArrowAltCircleDown className="animate-pulse" />
              </button>
            ))}
          {orders && !personalDetails && (
            <div className="flex flex-col items-center [&>*]:my-32">
              {userOrders?.map((el) => {
                return (
                  <OrderDetail
                    key={el.id}
                    id={el.id}
                    date={el.createdAt}
                    units={unitsData}
                    products={productsData}
                    paymentMethod={el.paymentMethod}
                    totalAmount={el.totalAmount}
                    unitsID={el.unitsID}
                  />
                );
              })}
            </div>
          )}
          {!orders && !personalDetails && (
            <>
              <Button
                click={handleLogOut}
                msg={
                  <>
                    <span>Log Out</span>
                    <FiLogOut />
                  </>
                }
              />
              <Button
                click={deleteUser}
                msg={
                  <>
                    <span>Delete Account</span>
                    <RiDeleteBin6Fill />
                  </>
                }
              />
            </>
          )}
        </div>
      ) : newAccount ? (
        <Signup swap={() => setNewAccount(false)} setNotification={(msg) => setNotification(msg)} />
      ) : (
        <Login swap={() => setNewAccount(true)} setNotification={(msg) => setNotification(msg)} />
      )}
    </div>
  );
};

export default Auth;
