import React, { useEffect } from "react";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useState } from "react";
import { api } from "../core/api";
import { IoIosWarning } from "react-icons/io";

const PaymentGateway = ({ total, confirmDelivery, setClientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState("");
  const [isCardValid, setIsCardValid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  console.log(total());

  const createPaymentIntent = async (amount) => {
    try {
      const response = await api.post("/create-payment-intent", {
        amount: amount * 100,
        currency: "eur",
      });
      if (response.status !== 200) {
        throw new Error(response.statusText);
      }

      const data = response.data;
      setClientSecret(data.clientSecret);
      console.log("Client secret:", data.clientSecret);
      return data.clientSecret;
    } catch (error) {
      console.error("Error creating payment intent: ", error);
      throw new Error(error.response?.data?.message || error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    const cardElement = elements.getElement(CardElement);
    try {
      const clientSecret = await createPaymentIntent(total());
      console.log("Client secret:", clientSecret);

      const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        setMessage(error.message);
        console.log("ERROR: ", error.message);
      } else {
        setMessage("Payment successful!");
        confirmDelivery();
        console.log("SUCCESS!!!");
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setMessage("An unexpected error occured... Please try again.");
    } finally {
      cardElement.clear();
      setIsProcessing(false);
    }
  };

  const handleCardChange = (event) => {
    setIsCardValid(event.complete);
  };

  return (
    <div className="m-5 p-5 w-1/2 self-center flex flex-col bg-white rounded-lg shadow-md shadow-white text-black">
      <div className="flex items-center text-[1.4rem] my-5 p-5 border border-red-500 rounded-md">
        <IoIosWarning className="text-red-500" />
        <p className="ml-5">
          Warning! After making a payment, your order will be locked, but you still have to fill in
          details to proceed.
        </p>
      </div>
      <CardElement onChange={handleCardChange} />
      <button
        className={`border border-black rounded-md px-5 self-center mt-10 ${
          (!isCardValid || isProcessing) && "opacity-50 cursor-not-allowed"
        }`}
        disabled={!stripe || !isCardValid || isProcessing}
        onClick={handleSubmit}>
        {isProcessing ? "Processing..." : "Pay"}
      </button>
      {message && <p className="my-4 text-red-500 self-center">{message}</p>}
    </div>
  );
};

export default PaymentGateway;
