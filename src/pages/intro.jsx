import React from "react";
import { FaShippingFast } from "react-icons/fa";
import { RiRefund2Line, RiCustomerService2Fill, RiShieldStarFill } from "react-icons/ri";
import { MdWorkspacePremium } from "react-icons/md";
import { GiCook, GiCampCookingPot, GiCookingPot } from "react-icons/gi";

const Intro = () => {
  return (
    <div className="w-full min-h-screen flex flex-col items-center">
      <div className="w-[80%] sm:w-full flex flex-col items-center p-10 my-20 sm:my-0 rounded-md shadow-lg shadow-red-800 sm:shadow-none bg-black/70">
        <h1 className="text-[4rem]">Welcome to our website!</h1>
        <p className="mt-10 px-[10rem] lg:px-0">
          Steelchefs is a company that specializes in selling high-quality kitchenware. We have a
          wide variety of products, from pots and pans to knives and cutting boards. Our products
          are made from the best materials and are designed to last a lifetime. We also offer fast
          and reliable shipping, so you can get your new kitchenware as soon as possible. If you
          have any questions or need help with anything, feel free to contact us. We are always
          happy to help our customers. Thank you for visiting our website, and we hope you find the
          perfect kitchenware for your home!
        </p>
        <div className="max-w-[80rem] max-h-[80rem] mt-10">
          <img
            src="https://jwylvnqdlbtbmxsencfu.supabase.co/storage/v1/object/public/steelchefs/staticImgs/Steelchefs.jpg"
            alt="Steelchefs intro picture"
            className="w-full h-full rounded-md"
          />
        </div>
        <div className="grid grid-cols-2 2xl:grid-cols-1 gap-x-10 gap-y-36 sm:gap-y-24 text-[2rem] w-full 2xl:w-auto mt-20 rounded-md self-center [&>*]:flex [&>*]:items-center bg-black/50 shadow-md shadow-black/50 p-20">
          <div className="[&>*]:mx-5">
            <FaShippingFast className="w-[10rem] h-[10rem]" />
            <p>Order until 3pm, receive your order the next working day!</p>
          </div>
          <div className="[&>*]:mx-5">
            <RiRefund2Line className="w-[10rem] h-[10rem]" />
            <p>30-day return policy, no questions asked!</p>
          </div>
          <div className="[&>*]:mx-5">
            <RiCustomerService2Fill className="w-[10rem] h-[10rem]" />
            <p>7am-7pm customer service Monday-Sunday!</p>
          </div>
          <div className="[&>*]:mx-5">
            <MdWorkspacePremium className="w-[10rem] h-[10rem]" />
            <p>High-quality products made from the best materials!</p>
          </div>
          <div className="[&>*]:mx-5">
            <GiCook className="w-[10rem] h-[10rem]" />
            <p>Run by professional chefs!</p>
          </div>
          <div className="[&>*]:mx-5">
            <GiCampCookingPot className="w-[10rem] h-[10rem]" />
            <p>Free recipes from our owners!</p>
          </div>
          <div className="[&>*]:mx-5">
            <RiShieldStarFill className="w-[10rem] h-[10rem]" />
            <p>Over 5K positive reviews!</p>
          </div>
          <div className="[&>*]:mx-5">
            <GiCookingPot className="w-[10rem] h-[10rem]" />
            <p>More than 1000 products for your kitchen!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Intro;
