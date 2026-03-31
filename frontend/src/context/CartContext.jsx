// src/context/CartContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import api from '../utils/api';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const token = localStorage.getItem('accessToken');
    const [cart, setCart] = useState({ items: [], subTotal: 0 });
    const [loading, setLoading] = useState(false);

    const updateQuantity = async (cartItemId, newQuantity) => {
        if (newQuantity < 1) return;
        try {
            await api.patch(`http://localhost:8000/cart/${cartItemId}`,
                { quantity: newQuantity }
            );
            fetchCart(); // Refresh data
        } catch (err) { 
            console.log(err); 
            toast.error("Update failed"); 
        }
    };

    const removeItem = async (cartItemId) => {
        try {
            const data = await api.delete(`http://localhost:8000/cart/${cartItemId}`);
            console.log(data)
            fetchCart();
        } catch (err) { 
            console.log(err)
            toast.error("Removal failed");
         }
    };

    const fetchCart = async (coupon) => {
        try {
            const { data } = await api.get(`http://localhost:8000/cart?coupon=${coupon}`, { headers: { Authorization: `Bearer ${token}` } });
            setCart(data);
            return data
        } catch (err) {
            console.error("Error fetching cart", err);
        }
    };

    const addToCart = async (productId, quantity = 1) => {
        setLoading(true);
        try {
            const { data } = await api.post('http://localhost:8000/cart/add',
                { productId, quantity }
            );
            await fetchCart();
            return data// Refresh cart data after adding
        } catch (err) {
            alert(err.response?.data?.message || "Failed to add to cart");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log(token)
        if (!token) {
            return;
        }
        fetchCart()
        console.log('Trigred')
    }, []);

    return (
        <CartContext.Provider value={{ cart, fetchCart, loading, addToCart, updateQuantity, removeItem }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);