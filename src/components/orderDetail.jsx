import React from "react";

const OrderDetail = ({ id, date, units, products, paymentMethod, totalAmount, unitsID }) => {
  return (
    <div className="flex flex-col items-center my-2 rounded-md bg-black shadow-md shadow-red-600 p-20 text-[2.5rem] 2xl:text-[2rem] lg:text-[1.5rem]">
      <div className="flex justify-around items-center w-full border-b border-red-500/20">
        <div className="flex items-center">Order ID: {id}</div>
        <div className="flex items-center">
          Date: {date.slice(8, 10)}-{date.slice(5, 7)}-{date.slice(0, 4)}
        </div>
        <div className="flex items-center">Payment method: {paymentMethod}</div>
      </div>
      <div className="flex flex-col items-center">
        <div className="flex items-center w-[100rem] 2xl:w-[90rem] xl:w-[80rem] lg:w-[60rem] sm:w-[40rem] [&>*]:mx-5 my-10">
          <div className="flex justify-center items-center w-[30%]">Title</div>
          <div className="flex justify-center items-center w-[20%]">Image</div>
          <div className="flex justify-center items-center w-[10%]">Quantity</div>
          <div className="flex justify-center items-center w-[10%]">Unit price</div>
          <div className="flex justify-center items-center w-[10%]">Total Price</div>
        </div>
        {units?.map((unit) => {
          if (unit.orderID === unitsID) {
            const relevantProduct = products?.find((product) => product.id === unit.productID);
            return (
              <div
                key={unit.id}
                className="flex items-center w-[100rem] 2xl:w-[90rem] xl:w-[80rem] lg:w-[60rem] sm:w-[40rem] [&>*]:mx-5 py-10 shadow-md shadow-red-800/50 rounded-md">
                <div className="flex justify-center items-center w-[30%]">
                  {relevantProduct
                    ? `${relevantProduct?.title}`
                    : `${unit.delivery === "0" ? "In person" : "DHL"} - ${unit.paymentMethod}`}
                </div>
                <div className="flex justify-center items-center w-[20%]">
                  {relevantProduct ? (
                    <img
                      src={relevantProduct?.image}
                      alt="Product image"
                      className="max-w-[10rem] max-h-[10%] rounded-md"
                    />
                  ) : (
                    "Delivery"
                  )}
                </div>
                <div className="flex justify-center items-center w-[10%]">{unit.quantity}</div>
                <div className="flex justify-center items-center w-[10%]">
                  {relevantProduct ? `${relevantProduct?.price} €` : `${unit.delivery} €`}
                </div>
                <div className="flex justify-center items-center w-[10%]">
                  {relevantProduct
                    ? `${relevantProduct?.price * unit.quantity} €`
                    : `${unit.delivery} €`}
                </div>
              </div>
            );
          }
        })}
      </div>
      <div className="flex items-center self-start text-[4rem] lg:text-[3rem] font-bold mt-20">
        Total amount: {totalAmount} €
      </div>
    </div>
  );
};

export default OrderDetail;
