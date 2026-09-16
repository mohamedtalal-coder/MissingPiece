import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App";
import { CartProvider } from "./features/cart/CartContext";
import "./global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CartProvider>
      <App />
    </CartProvider>
  </StrictMode>
);