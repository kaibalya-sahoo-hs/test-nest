import { createRoot } from "react-dom/client";
import { CartProvider } from "./context/CartContext";
import "./index.css";
import AllRoute from "./routes/AllRoute";
import App from "./App";
import { BrowserRouter } from "react-router";
import { Toaster } from "react-hot-toast";
import { UserProvider } from "./context/UserContext";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <CartProvider>
      <UserProvider>
        <Toaster />
        <App />
      </UserProvider>
    </CartProvider>
  </BrowserRouter>,
);
