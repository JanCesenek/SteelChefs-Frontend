import React from "react";
import { MdDelete } from "react-icons/md";

const Article = ({ id, image, title, category, author, deleteArticle, open }) => {
  const curUser = localStorage.getItem("curUser");
  const admin = localStorage.getItem("admin");

  return (
    <div
      key={id}
      className={`grid grid-cols-1 grid-rows-[10rem,1fr] relative flex-col items-center w-[30rem] h-[40rem] bg-black shadow-md shadow-red-500 my-10 p-20 hover:cursor-pointer hover:shadow-xl hover:shadow-red-500`}>
      {(author === curUser || admin === "true") && (
        <MdDelete
          className="absolute top-10 right-10 hover:cursor-pointer"
          title="Delete article"
          onClick={deleteArticle}
        />
      )}
      <div className="flex flex-col items-center">
        <h1 className="hover:underline text-[3rem]" onClick={open}>
          {title}
        </h1>
        <h2 className="text-[1.5rem]">{category}</h2>
        <h3 className="text-[1.7rem]">By {author}</h3>
      </div>
      <img src={image} alt="Article image" />
    </div>
  );
};

export default Article;
