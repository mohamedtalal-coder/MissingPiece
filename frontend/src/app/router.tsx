import { createBrowserRouter } from "react-router-dom";
import CartPage from "../features/cart/CartPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <div>Home placeholder</div>,
  },
  {
    path: "/cart",
    element: <CartPage />,
  },
]);