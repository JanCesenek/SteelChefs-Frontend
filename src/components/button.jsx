import React from "react";

const Button = ({ msg, click, classes, disabled }) => {
  return (
    <button
      className={`flex items-center [&>*]:mx-2 rounded-md bg-black text-red-500 border border-red-500/20 shadow-lg shadow-red-700/50 hover:border-black hover:bg-red-500 hover:text-black px-5 py-2 ${classes}`}
      onClick={click}
      disabled={disabled}>
      {msg}
    </button>
  );
};

export default Button;
