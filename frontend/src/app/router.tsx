import { createBrowserRouter } from "react-router-dom";
import CartPage from "../features/cart/CartPage";
import ProductListPage from "../features/products/ProductListPage";
import ProductDetailPage from "../features/products/ProductDetailPage";
import { RootLayout } from "../shared/components/layout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <div>Home placeholder</div>,
      },
      {
        path: "/products",
        element: <ProductListPage />,
      },
      {
        path: "/products/:slug",
        element: <ProductDetailPage />,
      },
      {
        path: "/cart",
        element: <CartPage />,
      },
    ]
  }
]);