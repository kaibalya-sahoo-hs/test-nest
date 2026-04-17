import { fireEvent, screen, waitFor } from "@testing-library/react";
import Login from "../pages/Login";
import Products from "../pages/Public/Products";
import CheckoutPage from "../pages/User/CheckoutPage";
import { expect, vi } from "vitest";
import { render } from "./test-utils";
import { Route, Routes } from "react-router";
import ProductPage from "../pages/ProductPage";
import CartPage from "../pages/CartPage";
import Nav from "../components/Nav";
import axios from "axios";

vi.mock('../api/axiosConfig', () => ({
    default: {
        post: vi.fn().mockResolvedValue({
            data: { id: 'order_test_123', amount: 50000 }
        }),
        get: vi.fn().mockResolvedValue({ data: [] }),
        // add other methods you use (put, delete, etc.)
    }
}))

describe('Feature: order', () => {
    test('should create a order', async () => {


        render(
            <Routes>
                <Route element={<Nav />}>
                    <Route path="/" element={<Products />} />
                    <Route path="/products/:id" element={<ProductPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                </Route>
            </Routes>,
            { initialEntries: ['/'] }
        );

        // Step 1: Find a product and navigate to its detail page
        const items = await screen.findAllByAltText(/Product image/i, { exact: false })
        fireEvent.click(items[0])

        // Step 2: Add product to cart
        const addToCartBtn = await screen.findByRole('button', { name: /add to cart/i })
        fireEvent.click(addToCartBtn)

        // Step 3: View cart
        const viewCartButton = await screen.findByRole('button', { name: /View Cart/i });
        fireEvent.click(viewCartButton)

        // Step 4: Verify cart page rendered with items
        await screen.findAllByText(/Shopping Cart/)
        const cartItems = await screen.findAllByAltText(/Product image/i, { exact: false })
        expect(cartItems[0]).toBeDefined()

        // Step 5: Proceed to checkout (redirects to login if not authenticated)
        const checkoutButton = await screen.findByRole('button', { name: /checkout btn/i })
        expect(checkoutButton).toBeDefined()
        fireEvent.click(checkoutButton)

        // Step 6: Login on the login page
        const emailInput = await screen.findByPlaceholderText(/esteban_schiller@gmail.com/)
        const passwordInput = await screen.findByPlaceholderText(/••••••/)
        const loginButton = await screen.findByRole("button", { name: /sign in/i })
        fireEvent.change(emailInput, { target: { value: "demo@gmail.com" } })
        fireEvent.change(passwordInput, { target: { value: 'demo@123' } })
        fireEvent.click(loginButton)

        await screen.findByText(/Price Details/i)
        const paymentButton = await screen.findByRole('button', { name: /payment button/i })

        axios.post.mockResolvedValue({
            data: { id: 'order_test_123', amount: 50000, currency: 'INR' }
        });

        await waitFor(() => {
            expect(global.window.Razorpay).toHaveBeenCalled();
        }, { timeout: 3000 });
        //     expect(global.window.Razorpay).toHaveBeenCalledWith(
        //     expect.objectContaining({
        //         amount: 50000, // 500.00 in paise
        //         currency: 'INR',
        //         name: 'DashStack'
        //     })
        // );
    })
})