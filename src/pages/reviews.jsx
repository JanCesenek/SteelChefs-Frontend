import React, { useEffect, useState } from "react";
import Loading from "../components/loading";
import { api } from "../core/api";
import { useUpdate } from "../hooks/use-update";
import { BsStar, BsStarFill, BsStarHalf } from "react-icons/bs";
import { MdAddCircle, MdDelete, MdError } from "react-icons/md";
import Review from "../components/review";
import Button from "../components/button";
import Notification from "../components/notification";

const Reviews = () => {
  const { data: usersData, refetch: refetchUsers, isLoading: usersLoading } = useUpdate("/users");
  const {
    data: reviewsData,
    refetch: refetchReviews,
    isLoading: reviewsLoading,
  } = useUpdate("/reviews");

  useEffect(() => {
    const fetchAll = async () => {
      await refetchUsers();
      await refetchReviews();
    };
    fetchAll();
  }, []);

  const getStars = (el) => {
    if (+el >= 4.75)
      return (
        <div className="flex justify-around">
          <BsStarFill />
          <BsStarFill />
          <BsStarFill />
          <BsStarFill />
          <BsStarFill />
        </div>
      );
    else if (+el < 4.75 && +el >= 4.25)
      return (
        <div className="flex justify-around">
          <BsStarFill />
          <BsStarFill />
          <BsStarFill />
          <BsStarFill />
          <BsStarHalf />
        </div>
      );
    else if (+el < 4.25 && +el >= 3.75)
      return (
        <div className="flex justify-around">
          <BsStarFill />
          <BsStarFill />
          <BsStarFill />
          <BsStarFill />
          <BsStar />
        </div>
      );
    else if (+el < 3.75 && +el >= 3.25)
      return (
        <div className="flex justify-around">
          <BsStarFill />
          <BsStarFill />
          <BsStarFill />
          <BsStarHalf />
          <BsStar />
        </div>
      );
    else if (+el < 3.25 && +el >= 2.75)
      return (
        <div className="flex justify-around">
          <BsStarFill />
          <BsStarFill />
          <BsStarFill />
          <BsStar />
          <BsStar />
        </div>
      );
    else if (+el < 2.75 && +el >= 2.25)
      return (
        <div className="flex justify-around">
          <BsStarFill />
          <BsStarFill />
          <BsStarHalf />
          <BsStar />
          <BsStar />
        </div>
      );
    else if (+el < 2.25 && +el >= 1.75)
      return (
        <div className="flex justify-around">
          <BsStarFill />
          <BsStarFill />
          <BsStar />
          <BsStar />
          <BsStar />
        </div>
      );
    else if (+el < 1.75 && +el >= 1.25)
      return (
        <div className="flex justify-around">
          <BsStarFill />
          <BsStarHalf />
          <BsStar />
          <BsStar />
          <BsStar />
        </div>
      );
    else if (+el < 1.25 && +el >= 0.75)
      return (
        <div className="flex justify-around">
          <BsStarFill />
          <BsStar />
          <BsStar />
          <BsStar />
          <BsStar />
        </div>
      );
    else if (+el < 0.75 && +el >= 0.25)
      return (
        <div className="flex justify-around">
          <BsStarHalf />
          <BsStar />
          <BsStar />
          <BsStar />
          <BsStar />
        </div>
      );
    else {
      return (
        <div className="flex justify-around">
          <BsStar />
          <BsStar />
          <BsStar />
          <BsStar />
          <BsStar />
        </div>
      );
    }
  };

  const [addReview, setAddReview] = useState(false);
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [notification, setNotification] = useState(false);

  const resetData = (msg) => {
    setNotification(msg);
    setAddReview(false);
    setSubmitting(false);
    setMessage("");
    setRating(1);
    setTimeout(() => {
      setNotification(false);
    }, 3000);
  };

  const submitReview = async () => {
    setSubmitting(true);
    await api
      .post("/reviews", {
        userID: userData?.id,
        message,
        rating,
      })
      .then(async () => {
        await refetchReviews();
        resetData(
          <>
            <MdAddCircle />
            <p>Review submitted successfully!</p>
          </>
        );
      })
      .catch((err) => {
        console.log(`Post req - ${err}`);
        resetData(
          <>
            <MdError />
            <p>Failed to submit review!</p>
          </>
        );
      });
  };

  const deleteReview = async (id) => {
    if (window.confirm("Really wanna delete the review?")) {
      await api
        .delete(`/reviews/${id}`)
        .then(async () => {
          await refetchReviews();
          resetData(
            <>
              <MdDelete />
              <p>Review deleted successfully!</p>
            </>
          );
        })
        .catch((err) => {
          console.log(`req - ${err}`);
          resetData(
            <>
              <MdError />
              <p>Failed to delete review!</p>
            </>
          );
        });
    }
  };

  const curUser = localStorage.getItem("curUser");
  const userData = usersData?.find((user) => user.username === curUser);

  const hasReview = reviewsData?.find((el) => el.userID === userData?.id);

  const loading = usersLoading || reviewsLoading;

  const ratingCount = reviewsData?.length;
  const avgRating = reviewsData?.reduce((acc, el) => acc + +el.rating, 0) / ratingCount;

  console.log(avgRating);

  if (loading) return <Loading msg={"Reviews are still loading..."} />;

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-[80%] sm:w-full flex flex-col items-center bg-black/70 rounded-md shadow-lg shadow-red-800 min-h-screen my-20 py-20 sm:my-0">
        {notification && <Notification msg={notification} />}
        <div className="flex flex-col items-center">
          {!hasReview && curUser && (
            <Button
              msg={addReview ? "Hide" : "Add Review"}
              click={() => setAddReview(!addReview)}
              classes="mt-10"
            />
          )}
          {addReview && (
            <div className="flex flex-col items-center [&>*]:my-5 bg-black p-10 mt-10 rounded-md shadow-md shadow-red-800/50">
              <div className="flex items-center [&>*]:px-2">
                <label htmlFor="message">Message:</label>
                <textarea
                  name="message"
                  id="message"
                  className="w-[30rem] h-[20rem] bg-transparent shadow-md shadow-red-800/50 focus:outline-none focus:shadow-red-600 rounded-md p-5"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              <div className="flex items-center [&>*]:px-2">
                <label htmlFor="rating">Rating:</label>
                <input
                  type="number"
                  name="rating"
                  id="rating"
                  className="bg-transparent shadow-md shadow-red-800/50 rounded-md px-2 focus:outline-none focus:shadow-red-600"
                  min={1}
                  max={5}
                  step={0.5}
                  value={+rating}
                  onChange={(e) => setRating(+e.target.value)}
                />
              </div>
              <Button
                msg={submitting ? "Submitting..." : "Submit"}
                disabled={submitting}
                classes={submitting && "cursor-not-allowed opacity-50"}
                click={submitReview}
              />
            </div>
          )}
          <div className="mt-20 flex flex-col items-center">
            <h1 className="text-[3rem]">Average Rating: {avgRating.toFixed(2)}</h1>
            <h2 className="text-[2.5rem] mb-20">Number of reviews: {ratingCount}</h2>
            {reviewsData?.map((el) => {
              const user = usersData?.find((user) => user.id === el.userID);
              return (
                <Review
                  key={el.id}
                  username={user?.username}
                  rating={getStars(el.rating)}
                  message={el.message}
                  deleteReview={() => deleteReview(el.id)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reviews;
