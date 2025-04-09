import React, { useState } from "react";
import { FaSignOutAlt } from "react-icons/fa";
import { ImCross } from "react-icons/im";
import Editor from "./editor";
import parse from "html-react-parser";
import { api } from "../core/api";
import Button from "./button";

const ArticleDetail = ({ id, image, title, category, owner, content, back, refetch }) => {
  const curUser = localStorage.getItem("curUser");

  const [edit, setEdit] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  const [newCategory, setNewCategory] = useState(category);
  const [newContent, setNewContent] = useState(content);
  const [submitting, setSubmitting] = useState(false);

  const [fullScreen, setFullScreen] = useState(false);

  const resetData = () => {
    setEdit(false);
    setFullScreen(false);
    setSubmitting(false);
    back();
  };

  const editContent = async () => {
    setSubmitting(true);

    await api
      .patch(`/articles/${id}`, {
        title: newTitle,
        category: newCategory,
        content: JSON.stringify(newContent),
      })
      .then(async () => {
        await refetch();
      })
      .catch((err) => {
        console.log(`Patch req - ${err}`);
      });
  };

  return (
    <div
      className={`bg-black flex flex-col relative items-center w-[90%] my-20 p-10 rounded-md shadow-md shadow-red-500 ${
        fullScreen && "fullscreen-editor"
      }`}>
      {fullScreen && (
        <ImCross
          className="absolute top-10 right-10 cursor-pointer"
          onClick={() => setFullScreen(false)}
        />
      )}
      {edit ? (
        <>
          <div className="flex items-center my-5 [&>*]:px-2">
            <label htmlFor="newTitle">Title:</label>
            <input
              type="text"
              id="newTitle"
              name="newTitle"
              className="bg-transparent border border-red-500/20 shadow-md shadow-red-800/50 focus:shadow-red-600 focus:outline-none rounded-md"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </div>
          <div className="flex items-center my-5 [&>*]:px-2">
            <label htmlFor="newCategory">Category:</label>
            <select
              name="newCategory"
              id="newCategory"
              className="bg-transparent border border-red-500/20 shadow-md shadow-red-800/50 focus:shadow-red-600 focus:outline-none rounded-md"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}>
              <option value="Article">Article</option>
              <option value="Recipe">Recipe</option>
            </select>
          </div>
          <Editor
            content={newContent}
            setContent={setNewContent}
            fullScreen={fullScreen}
            toggleFullScreen={() => setFullScreen(!fullScreen)}
          />
          <div className="flex items-center justify-around w-2/3">
            {!fullScreen && (
              <Button
                msg="Back"
                click={() => setEdit(false)}
                disabled={submitting}
                classes={submitting && "hover:cursor-not-allowed opacity-50"}
              />
            )}
            <Button
              msg={submitting ? "Submitting..." : "Save changes"}
              click={editContent}
              disabled={submitting}
              classes={submitting && "hover:cursor-not-allowed opacity-50"}
            />
          </div>
        </>
      ) : (
        <>
          <h1 className="text-[5rem] font-extrabold">{title}</h1>
          <h3 className="text-[1.5rem]">By {owner}</h3>
          <img
            src={image}
            alt="Article image"
            className="max-w-[100rem] max-h-[100rem] 2xl:max-w-[80rem] 2xl:max-h-[80rem] lg:max-w-[60rem] lg:max-h-[60rem] sm:max-w-[40rem] sm:max-h-[40rem] my-10 rounded-md"
          />
          <div className="pt-20 w-full border-t border-red-500/20">{parse(content)}</div>
          {curUser === owner && <Button msg="Edit" click={() => setEdit(true)} classes="mt-20" />}
          <FaSignOutAlt className="top-10 right-10 absolute hover:cursor-pointer" onClick={back} />
        </>
      )}
    </div>
  );
};

export default ArticleDetail;
