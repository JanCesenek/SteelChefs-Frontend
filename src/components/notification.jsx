import React from "react";
import classes from "./notification.module.css";

const Notification = ({ msg, css }) => {
  return (
    <div
      className={`flex items-center bg-red-500 text-black rounded-md shadow-lg shadow-red-700/50 border border-black px-5 py-2 [&>*]:mx-2 ${classes.fadeSlowly} ${css}`}>
      {msg}
    </div>
  );
};

export default Notification;
