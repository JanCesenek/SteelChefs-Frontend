import React, { useState, useEffect, useMemo, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../core/api";
import { useUpdate } from "../hooks/use-update";
import Loading from "../components/loading";
import { PiCookingPotFill } from "react-icons/pi";
import { FaArrowAltCircleRight } from "react-icons/fa";
import CartUnit from "../components/cartUnit";
import emailjs from "@emailjs/browser";
import PaymentGateway from "../components/paymentGateway";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Button from "../components/button";
import Notification from "../components/notification";
import { MdAddCircle, MdError } from "react-icons/md";
import { AuthContext } from "../context/AuthContext";

const Cart = () => {
  const { productNumber, updateProductNumber } = useContext(AuthContext);

  const serviceID = import.meta.env.VITE_SERVICE_ID;
  const templateID = import.meta.env.VITE_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_PUBLIC_KEY;

  const curUser = localStorage.getItem("curUser");
  const token = localStorage.getItem("token");
  const uniqueID = localStorage.getItem("uniqueID");
  const navigate = useNavigate();

  const { data: usersData, refetch: refetchUsers, isLoading: usersLoading } = useUpdate("/users");

  const {
    data: productsData,
    refetch: refetchProducts,
    isLoading: productsLoading,
  } = useUpdate("/products");

  const {
    data: unitsData,
    refetch: refetchUnits,
    isLoading: unitsLoading,
  } = useUpdate("/ordered-units");

  const { refetch: refetchOrders, isLoading: ordersLoading } = useUpdate("/orders");

  const [stripePromise, setStripePromise] = useState(null);
  const [paymentClientSecret, setPaymentClientSecret] = useState("");

  const [delivery, setDelivery] = useState("");
  const [payment, setPayment] = useState("");
  const [submittingDelivery, setSubmittingDelivery] = useState(false);
  const [submittingUnits, setSubmittingUnits] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  const userDetail = usersData?.find((el) => el.username === curUser);
  const userUnits = unitsData?.filter((el) => el.userID === userDetail?.id && !el.processed);
  const nonUserUnits = unitsData?.filter((el) => el.uniqueID === uniqueID && !el.processed);

  const relevantUnits = useMemo(() => {
    if (!unitsData) return [];
    return curUser ? userUnits : nonUserUnits;
  }, [curUser, unitsData, usersData]);

  const [dynamicMap, setDynamicMap] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      await refetchUsers();
      await refetchProducts();
      await refetchUnits();
      await refetchOrders();
    };
    fetchOrders();
  }, [curUser, refetchUsers, refetchProducts, refetchUnits, refetchOrders]);

  useEffect(() => {
    setDynamicMap(relevantUnits);
  }, [relevantUnits]);

  const getSum = (arg) => {
    let sum2 = 0;
    dynamicMap.forEach((el) => {
      const relevantProduct = productsData?.find((product) => product.id === el.productID);
      const dynamicPrice = el.delivery === null ? relevantProduct?.price : +el.delivery;
      sum2 += dynamicPrice * el.quantity;
    });
    if (arg) {
      return delivery === "DHL" ? sum2 + 5 : sum2;
    }
    return sum2;
  };

  useEffect(() => {
    api.get("/config").then(async (res) => {
      const { publishableKey } = await res.data;
      setStripePromise(loadStripe(publishableKey));
      console.log("Publishable key:", publishableKey);
    });
  }, []);

  useEffect(() => {
    api.post("/create-payment-intent", { amount: 1000, currency: "eur" }).then(async (res) => {
      const { clientSecret } = await res.data;
      setPaymentClientSecret(clientSecret);
      console.log("Client secret:", clientSecret);
    });
  }, []);

  let sum = 0;

  const [notification, setNotification] = useState(false);

  const [autofill, setAutofill] = useState(false);
  const [userAddress, setUserAddress] = useState({
    name: "",
    street: "",
    postcode: "",
    town: "",
    email: "",
    phone: "",
  });

  const unprocessedDelivery = unitsData?.find(
    (el) =>
      el.delivery && (el.userID === userDetail?.id || el.uniqueID === uniqueID) && !el.processed
  );
  const unsubmittedDHL = unitsData?.find(
    (el) =>
      (el.delivery === "5" || el.delivery === "6" || el.delivery === "0") &&
      (el.userID === userDetail?.id || el.uniqueID === uniqueID) &&
      !el.processed
  );

  const autofillAddress = () => {
    setAutofill(true);
    setUserAddress({
      name: `${userDetail?.firstName} ${userDetail?.lastName}`,
      street: userDetail?.street,
      postcode: userDetail?.postcode,
      town: userDetail?.town,
      email: userDetail?.email,
      phone: userDetail?.phone,
    });
  };

  const confirmDelivery = async () => {
    const randomCartUnit = unitsData?.find(
      (el) => (el.userID === userDetail?.id || el.uniqueID === uniqueID) && !el.processed
    );

    const deliveryCost = () => {
      if (delivery === "DHL") {
        return payment === "C.O.D." ? "6" : "5";
      } else {
        return "0";
      }
    };

    const postReqPayload = {
      userID: userDetail?.id || null,
      quantity: 1,
      delivery: deliveryCost(),
      paymentMethod: payment,
      uniqueID,
      orderID: randomCartUnit?.orderID,
    };

    setSubmittingDelivery(true);
    await api
      .post("/ordered-units", postReqPayload, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      })
      .then(async () => await refetchUnits())
      .catch((err) => console.log(`Post req - ${err}`));
    setDelivery("");
    setPayment("");
    setSubmittingDelivery(false);
  };

  const deleteUnit = async (id, quantity, productID, productQuantity) => {
    setSubmittingUnits(true);
    try {
      const requests = [api.delete(`/ordered-units/${id}`)];

      if (productID) {
        requests.push(
          api.patch(`/products/${productID}`, { quantity: productQuantity + quantity })
        );
      }

      await Promise.all(requests);

      await Promise.all([refetchUnits(), productID && refetchProducts()]);

      updateProductNumber(productNumber - quantity);
    } catch (err) {
      console.error("Error during delete/patch:", err);
      alert("An error occurred. Please try again.");
    } finally {
      setSubmittingUnits(false);
    }
  };

  const updateUnitQuantity = (id, newQuantity) => {
    setDynamicMap((prev) =>
      prev.map((unit) => (unit.id === id ? { ...unit, quantity: newQuantity } : unit))
    );
  };

  const resetData = (msg) => {
    setUserAddress({
      name: "",
      street: "",
      postcode: "",
      town: "",
      email: "",
      phone: "",
    });
    setNotification(msg);
    setTimeout(() => setNotification(false), 3000);
  };

  const submitOrder = async () => {
    setSubmittingOrder(true);

    const unprocessedDelivery = unitsData?.find(
      (el) =>
        el.paymentMethod &&
        (el.userID === userDetail?.id || el.uniqueID === uniqueID) &&
        !el.processed
    );

    const unprocessedUnits = unitsData?.filter(
      (el) => (el.userID === userDetail?.id || el.uniqueID === uniqueID) && !el.processed
    );

    const postReqPayloadWithUser = {
      unitsID: unprocessedDelivery?.orderID,
      userID: userDetail?.id,
      paymentMethod: unprocessedDelivery?.paymentMethod,
      totalAmount: getSum(),
      phone: userAddress.phone,
      email: userAddress.email,
      name: userAddress.name,
      street: userAddress.street,
      postcode: userAddress.postcode,
      town: userAddress.town,
    };

    const postReqPayloadWithoutUser = {
      unitsID: unprocessedDelivery?.orderID,
      paymentMethod: unprocessedDelivery?.paymentMethod,
      totalAmount: getSum(),
      phone: userAddress.phone,
      email: userAddress.email,
      name: userAddress.name,
      street: userAddress.street,
      postcode: userAddress.postcode,
      town: userAddress.town,
    };

    await api
      .post("/orders", userDetail?.id ? postReqPayloadWithUser : postReqPayloadWithoutUser)
      .then(async () => {
        await refetchOrders();

        const lastOrderResponse = await api.get("/last-order");
        const lastOrderData = lastOrderResponse.data;
        const allUnitsInOrder = unitsData?.filter((el) => el.orderID === lastOrderData?.unitsID);

        const generateEmailHTML = (orderData) => {
          const itemsHTML = orderData
            ?.map((el) => {
              const product = productsData?.find((product) => product.id === el.productID);
              return `<div style="display: flex; align-items: center; justify-content: space-between; margin: 1rem 0; width: 100%;">
            <h3 style="width: 20rem;">${
              product
                ? product?.title
                : `${el.delivery === "0" ? "In person" : "DHL"} - ${el.paymentMethod}`
            }</h3>
            ${
              product
                ? `<div style="width: 15rem;"><img src="${product?.image}" alt="${product?.title}" style="width: 8rem; height: 8rem; border-radius: 10px;" /></div>`
                : '<div style="width: 15rem;">Delivery</div>'
            }
            <div style="width: 8rem;">${el.quantity}</div>
            <div style="width: 8rem;">${product ? product?.price : el.delivery} €</div>
            <div style="width: 8rem;">${
              product ? product?.price * el.quantity : el.delivery
            } €</div>
            </div>`;
            })
            .join("");

          return `<div style="width: 65rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin: 1rem 0; width: 100%;">
              <h2 style="width: 20rem;">Title</h2>
              <h2 style="width: 15rem;">Image</h2>
              <h2 style="width: 8rem;">Quantity</h2>
              <h2 style="width: 8rem;">Unit price</h2>
              <h2 style="width: 8rem;">Total price</h2>
            </div>
            ${itemsHTML}
            <h2>Total amount: ${lastOrderData?.totalAmount} €</h2>
          </div>`;
        };

        const emailHTML = generateEmailHTML(allUnitsInOrder);

        const emailParams = {
          order_id: lastOrderData?.id,
          user_name: lastOrderData?.name,
          user_email: lastOrderData?.email,
          message: emailHTML,
        };

        emailjs
          .send(serviceID, templateID, emailParams, publicKey)
          .then((response) => {
            console.log("Email sent successfully!", response);
          })
          .catch((error) => {
            console.error("Error sending email:", error);
          });

        updateProductNumber(0);

        resetData(
          <>
            <MdAddCircle />
            <span>Order created successfully!</span>
          </>
        );
      })
      .catch((err) => {
        console.log(`Post req - ${err}`);
        resetData(
          <>
            <MdError />
            <span>Order could not be submitted, sorry. Please try again...</span>
          </>
        );
      });

    unprocessedUnits.map(async (el) => {
      await api
        .patch(`/ordered-units/${el.id}`, { processed: true })
        .then(async () => await refetchUnits())
        .catch((err) => console.log(`Patch req - ${err}`));
    });

    setSubmittingOrder(false);
  };

  const loading = unitsLoading || ordersLoading || usersLoading || productsLoading;

  const validForm =
    userAddress.name &&
    userAddress.street &&
    userAddress.postcode &&
    userAddress.town &&
    userAddress.email &&
    userAddress.phone;

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-[80%] xl:w-full flex flex-col items-center bg-black/70 rounded-md shadow-lg shadow-red-800 min-h-screen my-20 xl:my-0">
        {dynamicMap?.length > 0 && (
          <div className="flex items-center [&>*]:mx-2 mt-20">
            <span>Wanna go back and keep shopping? Click here.</span>
            <FaArrowAltCircleRight className="w-10 h-10" />
            <PiCookingPotFill
              className="w-20 h-20 animate-bounce hover:cursor-pointer"
              onClick={() => navigate("/products")}
            />
          </div>
        )}
        {loading && <Loading msg="Please wait. Order units are still loading..." />}
        {dynamicMap?.length > 0 ? (
          <div className="flex flex-col w-[120rem] 2xl:w-[100rem] md:w-[80rem] sm:w-[60rem] max-w-full text-[2rem] 2xl:text-[1.8rem] md:text-[1.5rem] sm:text-[1.2rem] mt-20 bg-black text-red-600 rounded-md py-10">
            <div className="flex flex-col [&>*]:px-5">
              <div className="flex w-full justify-center items-center border-b-2 border-red-600/20 pb-10 sm:text-[1rem]">
                <div className="w-[35%] flex justify-center items-center">
                  <h1>Title</h1>
                </div>
                <div className="w-[30%] flex justify-center items-center">
                  <h1>Image</h1>
                </div>
                <div className="w-[10%] flex justify-center items-center">
                  <h1>Quantity</h1>
                </div>
                <div className="w-[10%] flex justify-center items-center">
                  <h1>Unit price</h1>
                </div>
                <div className="w-[10%] flex justify-center items-center">
                  <h1>Total price</h1>
                </div>
              </div>
              {dynamicMap.map((el) => {
                const relevantProduct = productsData?.find(
                  (product) => product.id === el.productID
                );
                const dynamicPrice = el.delivery === null ? relevantProduct?.price : +el.delivery;
                sum += dynamicPrice * el.quantity;
                return (
                  <CartUnit
                    key={el.id}
                    id={el.id}
                    delivery={el.delivery}
                    payment={el.paymentMethod}
                    title={relevantProduct?.title}
                    image={relevantProduct?.image}
                    price={dynamicPrice}
                    quantity={el.quantity}
                    productID={relevantProduct?.id}
                    productQuantity={relevantProduct?.quantity}
                    submittingUnits={submittingUnits}
                    updateUnitQuantity={updateUnitQuantity}
                    deleteUnit={
                      el.delivery
                        ? () => deleteUnit(el.id)
                        : () =>
                            deleteUnit(
                              el.id,
                              el.quantity,
                              relevantProduct?.id,
                              relevantProduct?.quantity
                            )
                    }
                  />
                );
              })}
            </div>
            <div className="self-center flex items-center [&>*]:mx-2 my-20">
              <h1>Sum: {sum} €</h1>
            </div>
            {!unprocessedDelivery && (
              <>
                <div className="my-10 self-center flex justify-center items-center [&>*]:mx-2">
                  <label htmlFor="delivery">Choose a delivery option:</label>
                  <select
                    name="delivery"
                    id="delivery"
                    className="bg-transparent rounded-md border border-red-500/20 shadow-md shadow-red-800/50 focus:shadow-red-600 focus:outline-none"
                    value={delivery}
                    onChange={(e) => setDelivery(e.target.value)}>
                    <option value="">---</option>
                    <option value="DHL">DHL - 5€</option>
                    <option value="In person">In person - free</option>
                  </select>
                </div>
                <div className="my-10 self-center flex justify-center items-center [&>*]:mx-2">
                  <label htmlFor="payment">Choose a payment option:</label>
                  <select
                    name="payment"
                    id="payment"
                    className="bg-transparent rounded-md border border-red-500/20 shadow-md shadow-red-800/50 focus:shadow-red-600 focus:outline-none"
                    value={payment}
                    onChange={(e) => setPayment(e.target.value)}>
                    <option value="">---</option>
                    <option value="C.O.D.">C.O.D. {delivery === "DHL" && "(+1€)"}</option>
                    <option value="Bank transfer">Bank transfer</option>
                    <option value="Payment gateway">Payment gateway</option>
                  </select>
                </div>
                {stripePromise && paymentClientSecret && payment === "Payment gateway" && (
                  <Elements stripe={stripePromise} options={{ clientSecret: paymentClientSecret }}>
                    <PaymentGateway
                      total={() => getSum("YES")}
                      confirmDelivery={confirmDelivery}
                      setClientSecret={(arg) => setPaymentClientSecret(arg)}
                    />
                  </Elements>
                )}
                <Button
                  msg={submittingDelivery ? "Processing..." : "Confirm delivery + payment"}
                  disabled={payment === "Payment gateway"}
                  click={confirmDelivery}
                  classes={`${
                    (unprocessedDelivery ||
                      submittingDelivery ||
                      !delivery ||
                      !payment ||
                      payment === "Payment gateway") &&
                    "opacity-50 cursor-not-allowed"
                  } self-center`}
                />
              </>
            )}
            {unsubmittedDHL && (
              <div className="flex flex-col my-10 p-10 [&>*]:my-5 text-[2rem]">
                <h2 className="underline">Please fill in your details below:</h2>
                {!autofill && curUser && (
                  <div className="flex items-center [&>*]:mx-2">
                    <label htmlFor="autofill">Use your existing address: </label>
                    <input
                      type="radio"
                      name="autofill"
                      id="autofill"
                      value={autofill}
                      onChange={autofillAddress}
                    />
                  </div>
                )}
                <div className="flex items-center [&>*]:mx-2">
                  <label className="w-[10rem]" htmlFor="name">
                    Name:
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    className="bg-transparent rounded-md border border-red-500/20 shadow-md shadow-red-800/50 focus:shadow-red-600 focus:outline-none"
                    value={userAddress.name}
                    onChange={(e) => setUserAddress({ ...userAddress, name: e.target.value })}
                  />
                </div>
                <div className="flex items-center [&>*]:mx-2">
                  <label className="w-[10rem]" htmlFor="street">
                    Street:
                  </label>
                  <input
                    type="text"
                    name="street"
                    id="street"
                    className="bg-transparent rounded-md border border-red-500/20 shadow-md shadow-red-800/50 focus:shadow-red-600 focus:outline-none"
                    value={userAddress.street}
                    onChange={(e) => setUserAddress({ ...userAddress, street: e.target.value })}
                  />
                </div>
                <div className="flex items-center [&>*]:mx-2">
                  <label className="w-[10rem]" htmlFor="postcode">
                    Postcode:
                  </label>
                  <input
                    type="text"
                    name="postcode"
                    id="postcode"
                    className="bg-transparent rounded-md border border-red-500/20 shadow-md shadow-red-800/50 focus:shadow-red-600 focus:outline-none"
                    value={userAddress.postcode}
                    onChange={(e) => setUserAddress({ ...userAddress, postcode: e.target.value })}
                  />
                </div>
                <div className="flex items-center [&>*]:mx-2">
                  <label className="w-[10rem]" htmlFor="town">
                    Town:
                  </label>
                  <input
                    type="text"
                    name="town"
                    id="town"
                    className="bg-transparent rounded-md border border-red-500/20 shadow-md shadow-red-800/50 focus:shadow-red-600 focus:outline-none"
                    value={userAddress.town}
                    onChange={(e) => setUserAddress({ ...userAddress, town: e.target.value })}
                  />
                </div>
                <div className="flex items-center [&>*]:mx-2">
                  <label className="w-[10rem]" htmlFor="email">
                    Email:
                  </label>
                  <input
                    type="text"
                    name="email"
                    id="email"
                    className="bg-transparent rounded-md border border-red-500/20 shadow-md shadow-red-800/50 focus:shadow-red-600 focus:outline-none"
                    value={userAddress.email}
                    onChange={(e) => setUserAddress({ ...userAddress, email: e.target.value })}
                  />
                </div>
                <div className="flex items-center [&>*]:mx-2">
                  <label className="w-[10rem]" htmlFor="phone">
                    Phone:
                  </label>
                  <input
                    type="text"
                    name="phone"
                    id="phone"
                    className="bg-transparent rounded-md border border-red-500/20 shadow-md shadow-red-800/50 focus:shadow-red-600 focus:outline-none"
                    value={userAddress.phone}
                    onChange={(e) => setUserAddress({ ...userAddress, phone: e.target.value })}
                  />
                </div>
                <Button
                  msg={submittingOrder ? "Processing..." : "Submit order"}
                  click={submitOrder}
                  disabled={!validForm}
                  classes={`${
                    (submittingOrder || !validForm) && "opacity-50 cursor-not-allowed"
                  } self-center`}
                />
                {notification && <Notification msg={notification} css="mt-10 self-center" />}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center [&>*]:my-10">
            <div className="flex items-center [&>*]:mx-2">
              <span>You have no items in the cart yet! Browse through our selection here</span>
              <FaArrowAltCircleRight className="w-10 h-10" />
              <PiCookingPotFill
                className="w-20 h-20 animate-bounce hover:cursor-pointer"
                onClick={() => navigate("/products")}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
