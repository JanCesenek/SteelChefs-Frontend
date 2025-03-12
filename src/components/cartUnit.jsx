import React, { useState } from "react";
import { FaTrash, FaCheckCircle } from "react-icons/fa";
import { GrEdit } from "react-icons/gr";
import { api } from "../core/api";

const CartUnit = ({
  id,
  delivery,
  payment,
  title,
  image,
  price,
  quantity,
  productID,
  productQuantity,
  submittingUnits,
  updateUnitQuantity,
  deleteUnit,
}) => {
  const [editQuantity, setEditQuantity] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const editUnitQuantity = async () => {
    setSubmitting(true);
    try {
      await api.patch(`/ordered-units/${id}`, { quantity: +editQuantity });

      await api.patch(`/products/${productID}`, {
        quantity: productQuantity + quantity - +editQuantity,
      });

      updateUnitQuantity(id, Number(editQuantity));
    } catch (err) {
      console.error(`Error updating quantity: ${err}`);
    } finally {
      setSubmitting(false);
      setEditQuantity(false);
    }
  };

  return (
    <div
      key={id}
      className={`flex w-full bg-black rounded-md shadow-md shadow-red-800/50 justify-center items-center py-10 border-b border-red-600/20 ${
        (submittingUnits || submitting) && "cursor-not-allowed opacity-50"
      }`}>
      <div className="w-[35%] flex justify-center items-center">
        {delivery ? (
          <div>
            {delivery === "0" ? "Pick-up in person" : "DHL delivery"} - {payment}
          </div>
        ) : (
          <div>{title}</div>
        )}
      </div>
      <div className="w-[30%] flex justify-center items-center">
        {delivery ? (
          <span>Delivery</span>
        ) : (
          <img src={image} alt="Product img" className="max-w-[10rem] max-h-[10rem] rounded-md" />
        )}
      </div>
      <div className="w-[10%] flex justify-center items-center">
        {editQuantity && !delivery ? (
          <>
            <input
              type="number"
              name="quantity"
              id="quantity"
              min={1}
              max={productQuantity}
              className="w-[5rem] bg-transparent border border-red-600 rounded-md"
              value={+editQuantity}
              onChange={(e) => setEditQuantity(e.target.value)}
            />
            <FaCheckCircle className="hover:cursor-pointer ml-5" onClick={editUnitQuantity} />
          </>
        ) : (
          <>
            <div>{quantity}</div>
            {!delivery && (
              <GrEdit
                className="hover:cursor-pointer ml-5"
                onClick={() => setEditQuantity(quantity)}
              />
            )}
          </>
        )}
      </div>
      <div className="w-[10%] flex justify-center items-center">
        <div>{price} €</div>
      </div>
      <div className="w-[10%] flex justify-center items-center">
        <div>{price * quantity} €</div>
        <FaTrash
          className="hover:cursor-pointer w-[2rem] h-[2rem] sm:w-[1.5rem] sm:h-[1.5rem] ml-10 sm:ml-2"
          onClick={deleteUnit}
        />
      </div>
    </div>
  );
};

export default CartUnit;
