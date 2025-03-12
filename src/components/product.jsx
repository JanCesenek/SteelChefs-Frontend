import React from "react";
import { AiFillDelete } from "react-icons/ai";

const Product = ({ title, price, quantity, img, getDetail, remove }) => {
  const admin = localStorage.getItem("admin");

  return (
    <div className="opacity-80 grid relative grid-cols-2 grid-rows-[10rem,20rem,5rem] justify-items-center items-center w-[30rem] h-[40rem] rounded-lg shadow-lg shadow-red-600 p-10 text-[2rem] hover:translate-x-2 hover:translate-y-[-0.5rem] hover:opacity-100 hover:shadow-2xl hover:shadow-red-600 transition-all duration-300 bg-black">
      {admin === "true" && (
        <AiFillDelete
          className="absolute w-10 h-10 top-5 right-5 hover:cursor-pointer"
          onClick={remove}
        />
      )}
      <img
        src={img}
        alt="Some img"
        className="row-start-2 row-end-3 col-span-full max-w-[15rem] max-h-[15rem] rounded-md"
      />
      <div
        className="row-start-1 row-end-2 col-span-full rounded-md p-2 hover:cursor-pointer hover:underline hover:text-[2.2rem] hover:font-bold"
        onClick={getDetail}>
        {title}
      </div>
      <div className="row-start-3 row-end-4 col-start-1 col-end-2 rounded-md p-2">{price} €</div>
      <div className="row-start-3 row-end-4 col-start-2 col-end-3 rounded-md p-2">
        {quantity === 0 ? "Sold out" : quantity} {quantity > 0 && (quantity === 1 ? "pc" : "pcs")}
      </div>
    </div>
  );
};

export default Product;
