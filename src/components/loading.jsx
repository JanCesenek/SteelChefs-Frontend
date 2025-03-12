import React from "react";
import { FaHourglassHalf } from "react-icons/fa";

const Loading = ({ msg }) => {
  return (
    <div className="flex items-center text-[3rem] self-center mt-20">
      <span>{msg}</span>
      <FaHourglassHalf className="w-10 h-10 animate-spin" />
    </div>
  );
};

export default Loading;
