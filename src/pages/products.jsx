import React, { useState, useRef, useEffect, useContext } from "react";
import { Form } from "react-router-dom";
import { useUpdate } from "../hooks/use-update";
import { FaFolderPlus } from "react-icons/fa6";
import { BsFillFileImageFill } from "react-icons/bs";
import { GiMagnifyingGlass } from "react-icons/gi";
import { VscExpandAll, VscCollapseAll } from "react-icons/vsc";
import { v4 as uuid } from "uuid";
import { api } from "../core/api";
import supabase from "../core/sup";
import Product from "../components/product";
import ProductDetail from "../components/productDetail";
import Loading from "../components/loading";
import Button from "../components/button";
import { AuthContext } from "../context/AuthContext";

const Products = () => {
  const { notifyContext } = useContext(AuthContext);

  const { data: usersData, refetch: refetchUsers, isLoading: usersLoading } = useUpdate("/users");
  const {
    data: productsData,
    refetch: refetchProducts,
    isLoading: productsLoading,
  } = useUpdate("/products");
  const {
    data: imagesData,
    refetch: refetchImages,
    isLoading: imagesLoading,
  } = useUpdate("/images");
  const {
    data: unitsData,
    refetch: refetchUnits,
    isLoading: unitsLoading,
  } = useUpdate("/ordered-units");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        await refetchProducts();
        await refetchUnits();
        await refetchUsers();
        await refetchImages();
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchAll();
  }, []);

  const [addProduct, setAddProduct] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [productSpec, setProductSpec] = useState({
    title: "",
    description: "",
    price: 0,
    quantity: 0,
    category: "",
  });

  const [image, setImage] = useState(null);
  const [images, setImages] = useState([]);

  const [productDetail, setProductDetail] = useState(false);

  const [productSearch, setProductSearch] = useState("");

  const [showCategories, setShowCategories] = useState(false);
  const [category, setCategory] = useState("");

  const [filteredProducts, setFilteredProducts] = useState([]);

  const token = localStorage.getItem("token");

  const admin = localStorage.getItem("admin");

  const fileInputRef = useRef(null);
  const filesInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductSpec((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSearchChange = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setProductSearch(searchValue);

    const filtered = productsData.filter((product) => {
      const matchesSearch = product.title.toLowerCase().includes(searchValue);
      const matchesCategory = category ? product.category === category : true;
      return matchesSearch && matchesCategory;
    });

    setFilteredProducts(filtered);
  };

  const resetData = () => {
    setProductSpec({
      title: "",
      description: "",
      price: 0,
      quantity: 0,
      category: "",
    });
    setAddProduct(false);
    setImage(null);
    setImages([]);
  };

  const newProduct = async () => {
    const uniqueID = uuid();

    const handleUpload = async () => {
      const { data, error } = await supabase.storage
        .from("steelchefs")
        .upload(`products/${uniqueID}`, image, {
          cacheControl: "3600",
          upsert: false,
        });

      const { data: getData, error: getError } = await supabase.storage
        .from("steelchefs")
        .list("products");

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
      title: productSpec.title,
      description: productSpec.description,
      price: +productSpec.price,
      quantity: +productSpec.quantity,
      image: `https://jwylvnqdlbtbmxsencfu.supabase.co/storage/v1/object/public/steelchefs/products/${uniqueID}`,
      category: productSpec.category,
      uniqueID,
    };

    setSubmitting(true);
    await api
      .post("/products", postReqPayload)
      .then(async () => {
        await refetchProducts();
        notifyContext("Product created successfully!", "success");
      })
      .catch((err) => {
        console.log(`Post req - ${err}`);
        notifyContext("Error creating product!", "error");
      });

    const updatedProducts = await refetchProducts();
    const productID = updatedProducts?.data[0]?.id;

    const uploadMoreImgs = async () => {
      images?.map(async (_, i) => {
        const uniqueImgID = uuid();
        const { data, error } = await supabase.storage
          .from("steelchefs")
          .upload(`products/${uniqueID}_${uniqueImgID}`, images[i], {
            cacheControl: "3600",
            upsert: false,
          });

        const { data: getData, error: getError } = await supabase.storage
          .from("steelchefs")
          .list("products");

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

        const postReqPayload = {
          productID,
          url: `https://jwylvnqdlbtbmxsencfu.supabase.co/storage/v1/object/public/steelchefs/products/${uniqueID}_${uniqueImgID}`,
          uniqueID,
        };

        await api
          .post("/images", postReqPayload)
          .then(async () => await refetchImages())
          .catch((err) => {
            console.log(`Post req - ${err}`);
            notifyContext("Error uploading images!", "error");
          });
      });
    };
    images && (await uploadMoreImgs());
    resetData();
    setSubmitting(false);
  };

  const deleteProduct = async (id, uniqueID) => {
    if (window.confirm("Really wanna delete the product?")) {
      const { data: imgsData } = await supabase.storage.from("steelchefs").list("products");
      const relatedImgs = imgsData.filter((el) => el.name.includes(uniqueID));
      console.log(relatedImgs);
      relatedImgs?.map(async (el) => {
        const { data: imgsData, error: imgsError } = await supabase.storage
          .from("steelchefs")
          .remove([`products/${el.name}`]);
        if (imgsError) {
          console.log("Error deleting file", imgsError);
        } else {
          console.log("File successfully deleted!", imgsData);
        }
      });

      setSubmitting(true);
      await api
        .delete(`/products/${id}`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        })
        .then(async () => {
          await refetchProducts();
          notifyContext("Product deleted successfully!", "success");
        })
        .catch((err) => {
          console.log(`Delete req - ${err}`);
          notifyContext("Error deleting product!", "error");
        });
      setSubmitting(false);
    }
  };

  const changeCategory = (arg) => {
    setCategory(arg);
    setShowCategories(false);
  };

  const resetCategory = () => {
    setCategory("");
    setShowCategories(true);
  };

  const validForm =
    productSpec.title && productSpec.price && productSpec.quantity && productSpec.category && image;

  const loading = usersLoading || productsLoading || imagesLoading || unitsLoading;

  if (loading) return <Loading msg={"Products are still loading..."} />;

  return (
    <div
      className={`w-full min-h-screen flex flex-col items-center ${
        submitting && "cursor-not-allowed opacity-70 pointer-events-none"
      }`}>
      <div className="my-20 sm:my-0 w-[80%] sm:w-full flex flex-col items-center bg-black/70 rounded-md text-red-500 min-h-screen shadow-lg sm:shadow-none shadow-red-800 [&>*]:my-5">
        {admin === "true" && !productDetail && (
          <Button
            msg={
              addProduct ? (
                "Hide"
              ) : (
                <>
                  <span>Add Product</span>
                  <FaFolderPlus className="animate-pulse" />
                </>
              )
            }
            classes="!mt-10"
            click={() => setAddProduct(!addProduct)}
          />
        )}
        {addProduct && (
          <Form className="flex flex-col [&>*]:my-5 bg-black rounded-md p-20 shadow-md shadow-red-800 max-w-full">
            <div className="flex items-center">
              <label htmlFor="title" className="min-w-[15rem]">
                Title:
              </label>
              <input
                type="text"
                name="title"
                id="title"
                className="bg-transparent border border-red-500/20 shadow-md shadow-red-800/50 focus:shadow-red-600 focus:outline-none rounded-md"
                value={productSpec.title}
                onChange={handleChange}
              />
            </div>
            <div className="flex items-center">
              <label htmlFor="description" className="min-w-[15rem]">
                Description:
              </label>
              <textarea
                name="description"
                id="description"
                cols="30"
                rows="10"
                className="bg-transparent border border-red-500/20 shadow-md shadow-red-800/50 focus:shadow-red-600 focus:outline-none rounded-md"
                value={productSpec.description}
                onChange={handleChange}
              />
            </div>
            <div className="flex items-center">
              <label htmlFor="price" className="min-w-[15rem]">
                Price:
              </label>
              <input
                type="number"
                name="price"
                id="price"
                step={0.1}
                className="bg-transparent border border-red-500/20 shadow-md shadow-red-800/50 focus:shadow-red-600 focus:outline-none rounded-md w-[10rem]"
                value={productSpec.price}
                onChange={handleChange}
              />
            </div>
            <div className="flex items-center">
              <label htmlFor="quantity" className="min-w-[15rem]">
                Quantity:
              </label>
              <input
                type="number"
                name="quantity"
                id="quantity"
                step={1}
                className="bg-transparent border border-red-500/20 shadow-md shadow-red-800/50 focus:shadow-red-600 focus:outline-none rounded-md w-[10rem]"
                value={productSpec.quantity}
                onChange={handleChange}
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
            <div className="flex items-center">
              <label htmlFor="images" className="flex text-[2rem] hover:cursor-pointer">
                <span>More images (voluntary) {images && images.length}</span>{" "}
                <BsFillFileImageFill />
              </label>
              <input
                type="file"
                name="images"
                id="images"
                size="10"
                className="hidden"
                accept="image/*"
                multiple
                onChange={(e) => setImages([...images, ...e.target.files])}
                ref={filesInputRef}
              />
            </div>
            <div className="flex items-center">
              <label htmlFor="category" className="min-w-[15rem]">
                Category:
              </label>
              <select
                name="category"
                id="category"
                className="bg-transparent rounded-md border border-red-500/20 shadow-md shadow-red-800/50 focus:shadow-red-600 focus:outline-none"
                value={productSpec.category}
                onChange={handleChange}>
                <option value="">---</option>
                <option value="Cooking">Cooking</option>
                <option value="Baking">Baking</option>
                <option value="Accessories">Accessories</option>
                <option value="Appliances">Appliances</option>
              </select>
            </div>
            <Button
              msg={submitting ? "Submitting..." : "Submit"}
              disabled={submitting || !validForm}
              classes={`self-center !mt-20 ${
                (submitting || !validForm) && "cursor-not-allowed opacity-50"
              }`}
              click={newProduct}
            />
          </Form>
        )}
        {!showCategories && !addProduct && !productDetail && (
          <div className="flex relative flex-col items-center">
            <div className="flex items-center bg-black border border-red-500/20 shadow-md shadow-red-800/50 rounded-md">
              <GiMagnifyingGlass className="opacity-70 ml-2 text-gray-400" />
              <input
                type="text"
                value={productSearch}
                onChange={handleSearchChange}
                className="bg-transparent text-red-500 self-center focus:outline-none"
              />
              {productSearch && (
                <ul className="absolute top-full left-0 w-full bg-black border border-red-500/20 shadow-md shadow-red-800/50 rounded-md z-10">
                  {filteredProducts.map((product) => (
                    <li
                      key={product.id}
                      className="p-2 hover:bg-red-500 hover:text-white cursor-pointer"
                      onClick={() => {
                        setProductSearch(product.title);
                        setFilteredProducts([]);
                      }}>
                      {product.title}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
        {!addProduct && !productDetail && (
          <ul className="flex flex-col self-start ml-36 [&>:not(:first-child)]:ml-5">
            <div className="flex items-center text-[3rem]">
              {showCategories ? (
                <VscCollapseAll
                  className="hover:cursor-pointer"
                  onClick={() => setShowCategories(false)}
                />
              ) : (
                <VscExpandAll
                  className="hover:cursor-pointer"
                  onClick={category ? resetCategory : () => setShowCategories(true)}
                />
              )}
              <span>{category || "Categories"}</span>
            </div>
            {showCategories && (
              <>
                <li
                  className="border-l border-l-red-400 hover:cursor-pointer"
                  onClick={() => changeCategory("Cooking")}>
                  --- Cooking
                </li>
                <li
                  className="border-l border-l-red-400 hover:cursor-pointer"
                  onClick={() => changeCategory("Baking")}>
                  --- Baking
                </li>
                <li
                  className="border-l border-l-red-400 hover:cursor-pointer"
                  onClick={() => changeCategory("Accessories")}>
                  --- Accessories
                </li>
                <li
                  className="border-l border-l-red-400 hover:cursor-pointer"
                  onClick={() => changeCategory("Appliances")}>
                  --- Appliances
                </li>
              </>
            )}
          </ul>
        )}
        {productDetail ? (
          <ProductDetail
            id={productDetail.id}
            title={productDetail.title}
            description={productDetail.description}
            img={productDetail.img}
            price={productDetail.price}
            quantity={productDetail.quantity}
            usersData={usersData}
            imagesData={imagesData}
            unitsData={unitsData}
            back={() => setProductDetail(false)}
          />
        ) : (
          !addProduct && (
            <div className="grid justify-items-center grid-cols-4 2xl:grid-cols-3 lg:grid-cols-2 sm:grid-cols-1 gap-10 px-20 !my-20 w-full">
              {productsData?.map((el) => {
                const productPattern = (
                  <Product
                    id={el.id}
                    title={el.title}
                    price={el.price}
                    quantity={el.quantity}
                    img={el.image}
                    key={el.id}
                    uniqueID={el.uniqueID}
                    getDetail={() =>
                      setProductDetail({
                        id: el.id,
                        title: el.title,
                        description: el.description,
                        img: el.image,
                        price: el.price,
                        quantity: el.quantity,
                      })
                    }
                    remove={() => deleteProduct(el.id, el.uniqueID)}
                  />
                );
                if (productSearch && !category) {
                  if (el.title.toLowerCase().includes(productSearch.toLowerCase())) {
                    return productPattern;
                  }
                } else if (category) {
                  if (productSearch) {
                    if (
                      el.title.toLowerCase().includes(productSearch.toLowerCase()) &&
                      el.category === category
                    ) {
                      return productPattern;
                    }
                  } else if (el.category === category) {
                    return productPattern;
                  }
                } else return productPattern;
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Products;
