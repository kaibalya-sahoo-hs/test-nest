import React from "react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import AdminRoute from "../components/AdminRoute";
import Admin from "../pages/Admin";
import ApiLogs from "../pages/ApiLogs";
import FavoritesPage from "../pages/FavoritesPage";
import Login from "../pages/Login";
import ProductStock from "../pages/ProductStock";
import Profile from "../pages/Profile";
import Register from "../pages/Register";
import Stats from "../pages/Stats";
import Users from "../pages/Users";
import UserProfile from "../pages/UserProfile";
import CompleteRegistration from "../pages/CompleteRegistartion";
import NotFound from "../pages/NotFound";
import ProductPage from "../pages/ProductPage";
import Index from "../pages/Index";
import CartPage from "../pages/CartPage";
import Nav from "../components/Nav";
import MyOrders from "../pages/OrdersPage";
import OrdersPage from "../pages/OrdersPage";
import Products from "../pages/Public/Products";
import ManageProducts from "../pages/ManageProducts";
import AddressManager from "../pages/User/AddressManager";
import VendorRegistration from "../pages/Vendor/VendorRegistration";
import VendorDashboard from "../pages/Vendor/VendorDashboard";
import VendorProfile from "../pages/Vendor/VendorProfile";
import VendorProducts from "../pages/Vendor/VendorProducts";
import CheckoutPage from "../pages/User/CheckoutPage";

function AllRoute() {
  return (
    <BrowserRouter>
      <Toaster />

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/auth/register/complete"
          element={<CompleteRegistration />}
        />
        <Route path="/vendor/register" element={<VendorRegistration/>}/>
        <Route element={<Nav />}>
          <Route path="/" element={<Index/>}/>
          <Route path="/address" element={<AddressManager/>}/>
          <Route path="/cart" element={<CartPage/>} />
          <Route path="/products" element={<Products />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<OrdersPage/>}/>
          <Route path="/products/:id" element={<ProductPage />} />
          <Route path="/checkout" element={<CheckoutPage/>} />
          {/* Admin routes */}
          <Route path="/admin/dashboard" element={<AdminRoute><Admin /></AdminRoute>} />
          <Route path="/admin/apilogs" element={<AdminRoute><ApiLogs /></AdminRoute>} />
          <Route path="/admin/charts" element={<AdminRoute><Stats /></AdminRoute>} />
          <Route path="/admin/products" element={<AdminRoute><ManageProducts /></AdminRoute>} />
          <Route path="/admin/favourites" element={<AdminRoute><FavoritesPage /></AdminRoute>} />
          <Route path="/admin/stock" element={<AdminRoute><ProductStock /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><Users /></AdminRoute>} />
          <Route path="/admin/users/:id" element={<AdminRoute><UserProfile /></AdminRoute>} />

          {/* Vendor Routes */}
          <Route path="/vendor/dashboard" element={<VendorDashboard/>}/>
          <Route path="/vendor/profile" element={<VendorProfile/>}/>
          <Route path="/vendor/products" element={<VendorProducts/>}/>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AllRoute;
