import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RootLayout from "./pages/root";
import Intro from "./pages/intro";
import Products from "./pages/products";
import Blog from "./pages/blog";
import Reviews from "./pages/reviews";
import Contact from "./pages/contact";
import Cart from "./pages/cart";
import Auth from "./pages/auth";
import { AuthProvider } from "./context/AuthContext";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <RootLayout />,
      children: [
        { index: true, element: <Intro /> },
        { path: "products", element: <Products /> },
        { path: "blog", element: <Blog /> },
        { path: "reviews", element: <Reviews /> },
        { path: "contact", element: <Contact /> },
        { path: "auth", element: <Auth /> },
        { path: "cart", element: <Cart /> },
      ],
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
    },
  }
);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
    </AuthProvider>
  );
}

export default App;
