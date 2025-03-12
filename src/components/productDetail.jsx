import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdLogout } from "react-icons/md";
import { FaArrowAltCircleLeft, FaArrowAltCircleRight } from "react-icons/fa";
import { ImCross } from "react-icons/im";
import { api } from "../core/api";
import { v4 as uuid } from "uuid";
import Button from "./button";

const ProductDetail = ({
  id,
  title,
  description,
  img,
  price,
  quantity,
  usersData,
  imagesData,
  unitsData,
  back,
}) => {
  const [purchasedAmount, setPurchasedAmount] = useState(1);

  const [fullScreen, setFullScreen] = useState(false);

  const curUser = localStorage.getItem("curUser");
  const uniqueID = localStorage.getItem("uniqueID");

  const thisUser = usersData?.find((el) => el.username === curUser);

  const allImages = imagesData?.filter((el) => el.productID === id);
  const filteredUrls = () => {
    const imgArray = [img];
    allImages.map((el) => {
      imgArray.push(el.url);
    });
    return imgArray;
  };
  const picsAmount = filteredUrls().length;
  const [imgs, setImgs] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const purchaseItem = async () => {
    const cartNotEmpty = unitsData?.find(
      (el) => (el.userID === thisUser?.id || el.uniqueID === uniqueID) && !el.processed
    );
    console.log(cartNotEmpty);
    const newOrderID = uuid();

    setSubmitting(true);
    try {
      await api.post("/ordered-units", {
        productID: id,
        quantity: +purchasedAmount,
        uniqueID,
        userID: thisUser?.id,
        orderID: cartNotEmpty ? cartNotEmpty.orderID : newOrderID,
      });

      await api.patch(`/products/${id}`, { quantity: quantity - +purchasedAmount });
    } catch (err) {
      console.error(`Error updating quantity: ${err}`);
    } finally {
      setPurchasedAmount(1);
      setSubmitting(false);
    }

    navigate("/cart");
  };

  return (
    <div className="flex w-[90%] relative flex-col items-center rounded-lg bg-black shadow-md shadow-red-800/50 p-20 !mt-20 [&>*]:my-10">
      {!fullScreen && (
        <MdLogout
          className="absolute top-10 right-10 w-20 h-20 hover:cursor-pointer"
          onClick={back}
        />
      )}
      {!fullScreen && <h1 className="font-bold text-[4rem] underline md:!mt-20">{title}</h1>}
      <div className={`flex items-center [&>*]:mx-5 ${fullScreen && "w-[80%] bg-black/90"}`}>
        {picsAmount > 1 && (
          <FaArrowAltCircleLeft
            className="w-10 h-10 hover:cursor-pointer"
            onClick={() => setImgs(Math.abs((imgs + picsAmount - 1) % picsAmount))}
          />
        )}
        <img
          src={filteredUrls()[imgs]}
          alt="Some img"
          className={`${
            fullScreen ? "max-w-[80%] max-h-[80%]" : "max-w-[30rem] max-h-[30rem]"
          } rounded-md ${!fullScreen && "hover:cursor-pointer"}`}
          onClick={fullScreen ? undefined : () => setFullScreen(true)}
        />
        {picsAmount > 1 && (
          <FaArrowAltCircleRight
            className="w-10 h-10 hover:cursor-pointer"
            onClick={() => setImgs(Math.abs((imgs + 1) % picsAmount))}
          />
        )}
        {fullScreen && (
          <ImCross
            className="absolute top-10 right-10 w-20 h-20 hover:cursor-pointer"
            onClick={() => setFullScreen(false)}
          />
        )}
      </div>
      {!fullScreen && (
        <div className="flex w-full justify-around text-[3rem] font-bold">
          <p>{price} €</p>
          <p>
            {quantity === 0 ? "Sold out!" : quantity}{" "}
            {quantity > 0 && (quantity === 1 ? "pc in stock" : "pcs in stock")}
          </p>
        </div>
      )}
      {quantity > 0 && !fullScreen && (
        <div className="flex justify-center items-center [&>*]:mx-5">
          <input
            type="number"
            name="quantity"
            id="quantity"
            value={purchasedAmount}
            onChange={(e) => setPurchasedAmount(e.target.value)}
            min={1}
            max={quantity}
            className="bg-transparent border border-red-500/20 shadow-md shadow-red-800/50 focus:shadow-red-600 focus:outline-none rounded-md w-[5rem]"
          />
          <Button
            classes={submitting && "opacity-70 cursor-not-allowed"}
            disabled={submitting}
            click={purchaseItem}
            msg={submitting ? "Purchasing..." : "Purchase"}
          />
        </div>
      )}
      {!fullScreen && <p className="text-[3rem]">{description}</p>}
    </div>
  );
};

export default ProductDetail;
