import React from "react";
import { MdDelete } from "react-icons/md";

const Review = ({ username, rating, message, deleteReview }) => {
  const curUser = localStorage.getItem("curUser");

  return (
    <div className="relative shadow-md shadow-red-500 bg-black rounded-md p-5 my-5 w-[50rem]">
      {curUser === username && (
        <MdDelete className="absolute top-5 right-5 hover:cursor-pointer" onClick={deleteReview} />
      )}
      <div className="flex justify-around text-[1.5rem] border-b border-red-500/20 py-2">
        <div className="flex items-center [&>*]:mx-2">
          <img
            src="https://jwylvnqdlbtbmxsencfu.supabase.co/storage/v1/object/public/steelchefs/staticImgs/defaultUser.png"
            alt="Default user pic"
            className="w-10 h-10 rounded-full"
          />
          <p>{username}</p>
        </div>
        <div className="flex items-center justify-around">{rating}</div>
      </div>
      <p className="p-5 text-[2rem]">{message}</p>
    </div>
  );
};

export default Review;
