import React, { useEffect, useState, useRef, useContext } from "react";
import Editor, { editorExtensions } from "../components/editor";
import { api } from "../core/api";
import { useUpdate } from "../hooks/use-update";
import Loading from "../components/loading";
import { generateHTML } from "@tiptap/react";
import Article from "../components/article";
import ArticleDetail from "../components/articleDetail";
import { ImCross } from "react-icons/im";
import Button from "../components/button";
import { MdAddCircle, MdDelete, MdError } from "react-icons/md";
import { BsFillFileImageFill } from "react-icons/bs";
import { v4 as uuid } from "uuid";
import supabase from "../core/sup";
import { AuthContext } from "../context/AuthContext";

const Blog = () => {
  const { notifyContext } = useContext(AuthContext);

  const [addArticle, setAddArticle] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState(null);

  const [articleDetail, setArticleDetail] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null);

  const { data: usersData, refetch: refetchUsers, isLoading: usersLoading } = useUpdate("/users");

  const {
    data: articlesData,
    refetch: refetchArticles,
    isLoading: articlesLoading,
  } = useUpdate("/articles");

  useEffect(() => {
    const fetchAll = async () => {
      await refetchArticles();
      await refetchUsers();
    };
    fetchAll();
  }, []);

  const curUser = localStorage.getItem("curUser");

  const userData = usersData?.find((user) => user.username === curUser);

  const resetData = () => {
    setTitle("");
    setImage(null);
    setCategory("");
    setContent(null);
    setAddArticle(false);
    setSubmitting(false);
    fullScreen && setFullScreen(false);
  };

  const createArticle = async () => {
    const uniqueID = uuid();

    const handleUpload = async () => {
      const { data, error } = await supabase.storage
        .from("steelchefs")
        .upload(`articles/${uniqueID}`, image, {
          cacheControl: "3600",
          upsert: false,
        });

      const { data: getData, error: getError } = await supabase.storage
        .from("steelchefs")
        .list("articles");

      if (error) {
        console.log("Error uploading file...", error);
      } else {
        console.log("File uploaded!", data.path);
      }

      if (getError) {
        console.log("Error listing files...", getError);
      } else {
        console.log("Files listed!", getData);
      }
    };
    await handleUpload();

    const postReqPayload = {
      userID: userData?.id,
      title,
      image: `https://jwylvnqdlbtbmxsencfu.supabase.co/storage/v1/object/public/steelchefs/articles/${uniqueID}`,
      category,
      content: JSON.stringify(content),
    };

    setSubmitting(true);

    await api
      .post("/articles", postReqPayload)
      .then(async () => {
        await refetchArticles();
        notifyContext("Article created successfully!", "success");
      })
      .catch((err) => {
        console.log(`Post req - ${err}`);
        notifyContext("Failed to create article!", "error");
      })
      .finally(() => {
        setSubmitting(false);
        resetData();
      });
  };

  const deleteArticle = async (id) => {
    if (window.confirm("Are you sure you want to delete this article?")) {
      setSubmitting(true);
      await api
        .delete(`/articles/${id}`)
        .then(async () => {
          await refetchArticles();
          notifyContext("Article deleted successfully!", "success");
        })
        .catch((err) => {
          console.log(`Delete req - ${err}`);
          notifyContext("Failed to delete article!", "error");
        })
        .finally(() => {
          setSubmitting(false);
        });
    }
  };

  const validForm = title && category && content;

  const loading = articlesLoading || usersLoading;

  if (loading) return <Loading msg={"Articles are still loading..."} />;

  return (
    <div
      className={`w-full flex flex-col items-center ${
        submitting && "cursor-not-allowed opacity-70 pointer-events-none"
      }`}>
      <div className="w-[80%] sm:w-full flex flex-col items-center bg-black/70 rounded-md shadow-lg shadow-red-800 min-h-screen my-20 sm:my-0">
        {!articleDetail && (
          <Button
            click={() => setAddArticle(!addArticle)}
            msg={addArticle ? "Hide" : "Add article"}
            classes="my-10"
          />
        )}
        {articleDetail ? (
          <ArticleDetail
            id={articleDetail?.id}
            image={articleDetail?.image}
            title={articleDetail?.title}
            category={articleDetail?.category}
            owner={articleDetail?.owner}
            content={articleDetail?.content}
            back={() => setArticleDetail(false)}
            refetch={refetchArticles}
          />
        ) : addArticle ? (
          <div
            className={`flex flex-col relative bg-black items-center rounded-md shadow-md w-3/4 shadow-red-500 my-20 [&>*]:my-10 ${
              fullScreen && "fullscreen-editor"
            }`}>
            {fullScreen && (
              <ImCross
                className="absolute top-10 right-10 cursor-pointer"
                onClick={() => setFullScreen(false)}
              />
            )}
            <h1 className="text-[4rem]">Article Editor</h1>
            <div className="flex items-center [&>*]:px-5">
              <label htmlFor="title">Title:</label>
              <input
                type="text"
                name="title"
                id="title"
                className="bg-transparent border border-red-500/20 shadow-md shadow-red-800/50 focus:shadow-red-600 focus:outline-none rounded-md px-5"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="flex items-center">
              <label htmlFor="image" className="flex w-[15rem] text-[2rem] hover:cursor-pointer">
                <BsFillFileImageFill />
                <span>{image ? image?.name : "Upload image"}</span>
              </label>
              <input
                type="file"
                name="image"
                id="image"
                size="10"
                className="hidden"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                ref={fileInputRef}
              />
            </div>
            <div className="flex items-center [&>*]:px-5">
              <label htmlFor="category">Category:</label>
              <select
                name="category"
                id="category"
                className="bg-transparent border border-red-500/20 shadow-md shadow-red-800/50 focus:shadow-red-600 focus:outline-none rounded-md px-5"
                value={category}
                onChange={(e) => setCategory(e.target.value)}>
                <option value="">---</option>
                <option value="Articles">Articles</option>
                <option value="Recipes">Recipes</option>
              </select>
            </div>

            <Editor
              content={content}
              setContent={setContent}
              fullScreen={fullScreen}
              toggleFullScreen={() => setFullScreen(!fullScreen)}
              editorExtensions={editorExtensions}
            />
            <Button
              msg={submitting ? "Submitting..." : "Submit"}
              disabled={!validForm || submitting}
              click={createArticle}
              classes={(!validForm || submitting) && "opacity-50 cursor-not-allowed"}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center w-full">
            <div className="grid justify-items-center grid-cols-4 2xl:grid-cols-3 lg:grid-cols-2 sm:grid-cols-1 w-[90%]">
              {articlesData?.map((article) => {
                const articleOwner = usersData.find((user) => user.id === article.userID);
                const htmlContent = generateHTML(JSON.parse(article.content), editorExtensions);
                return (
                  <Article
                    key={article.id}
                    id={article.id}
                    image={article.image}
                    title={article.title}
                    category={article.category}
                    author={articleOwner?.username}
                    deleteArticle={() => deleteArticle(article.id)}
                    open={() => {
                      setArticleDetail({
                        id: article.id,
                        image: article.image,
                        title: article.title,
                        category: article.category,
                        owner: articleOwner?.username,
                        content: htmlContent,
                      });
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
