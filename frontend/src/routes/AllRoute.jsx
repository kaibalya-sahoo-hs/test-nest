import React from "react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import AdminRoute from "../components/AdminRoute";
import Admin from "../pages/Admin";
import ApiLogs from "../pages/ApiLogs";
import FavoritesPage from "../pages/FavoritesPage";
import Login from "../pages/Login";
import Products from "../pages/Products";
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

function AllRoute() {
  return (
    <BrowserRouter>
      <Toaster />

      <Routes>
      <Route path="/" element={<Navigate to={'/products'}/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/auth/register/complete"
          element={<CompleteRegistration />}
        />
        <Route element={<Nav />}>
          <Route path="/cart" element={<CartPage/>} />
          <Route path="/products" element={<Index />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin/dashboard" element={<AdminRoute><Admin /></AdminRoute>} />
          <Route path="/admin/apilogs" element={<AdminRoute><ApiLogs /></AdminRoute>} />
          <Route path="/admin/charts" element={<AdminRoute><Stats /></AdminRoute>} />
          <Route path="/admin/products" element={<AdminRoute><Products /></AdminRoute>} />
          <Route path="/admin/favourites" element={<AdminRoute><FavoritesPage /></AdminRoute>} />
          <Route path="/admin/stock" element={<AdminRoute><ProductStock /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><Users /></AdminRoute>} />
          <Route path="/admin/users/:id" element={<AdminRoute><UserProfile /></AdminRoute>} />
          <Route path="/products/:id" element={<ProductPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AllRoute;
