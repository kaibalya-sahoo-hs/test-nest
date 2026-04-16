import { Route, Routes } from "react-router"
import { render } from "../../test-utils"
import { beforeEach, describe, expect, test } from "vitest"
import VendorDashboard from "../../pages/Vendor/VendorDashboard"
import VendorLogin from "../../pages/Vendor/VendorLogin"
import VendorProducts from "../../pages/Vendor/VendorProducts"
import { fireEvent, screen, waitFor } from "@testing-library/react"
import Nav from "../../components/Nav"
import userEvent from '@testing-library/user-event';

const user = userEvent.setup()

describe('feature: Vendor Products', () => {
    let emailInput
    let passwordInput
    let loginButton
    beforeEach(async () => {
        // render vendore login and then dashboard and then navigate to products page
        render(
            <Routes>
                <Route element={<Nav />} >
                    <Route path="/" element={<VendorLogin />} />
                    <Route path="/vendor/dashboard" element={<VendorDashboard />} />
                    <Route path="/vendor/products" element={<VendorProducts />} />
                </Route>
            </Routes>
        )
        emailInput = screen.getByPlaceholderText(/name@store.com/i)
        passwordInput = screen.getByPlaceholderText(/••••••••/i)
        loginButton = screen.getByRole("button", { name: /vendor-signin/i })

        fireEvent.change(emailInput, { target: { value: `seller1@gmail.com` } })
        fireEvent.change(passwordInput, { target: { value: "seller1" } })
        fireEvent.click(loginButton)
        const welcomeText = await screen.findAllByText(/Welcome to your dashboard/i)
        expect(welcomeText[0])
        const productsLink = await screen.findByRole('link', { name: /Products/i })
        fireEvent.click(productsLink)

    })
    test('Scenario: Vendor can view products ', async () => {
        await screen.findByText(/Manage your store inventory and pricing/i)
    })
    test.only('Scenario: Vendor can delete products ', async () => {
        // try {
            const productPageText = await screen.findByText(/Manage your store inventory and pricing/i)
            expect(productPageText)
            const removeButtons = await screen.findAllByRole('button', { name: /remove product/i })
            expect(removeButtons[1])
            fireEvent.click(removeButtons[1])
            await screen.findByText(/Product deleted/i)
        // } catch (error) {

        // }
    })

    test('Scenario: Vendor can add products ', async () => {
        const productPageText = await screen.findByText(/Manage your store inventory and pricing/i)
        expect(productPageText)
        const addproductButton = await screen.findByRole('button', { name: /add product/i })
        fireEvent.click(addproductButton)

        screen.debug()

        const text = await screen.findByText(/Create a new product/)
        expect(text)

        const nameInput = await screen.findByPlaceholderText(/title/i)
        const priceInput = await screen.findByPlaceholderText(/Price/i)
        const stockInput = await screen.findByPlaceholderText(/Stock/i)
        const descriptionInput = await screen.findByPlaceholderText(/Description/i)
        const catagoryInput = await screen.findByPlaceholderText(/Category/i)
        const submitButton = await screen.findByRole('button', { name: /Create Product/i })

        // handle file upalod

        const pngData = new Uint8Array([
            0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
            0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
            0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
            0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x01,
            0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44,
            0xae, 0x42, 0x60, 0x82
        ]);

        const fileInput = await screen.findByLabelText(/Click to upload product image/i)
        const testFile = new File([pngData], "test.png", { type: "image/png" })
        await user.upload(fileInput, testFile)

        fireEvent.change(nameInput, { target: { value: "Test Product" } })
        fireEvent.change(priceInput, { target: { value: "19.99" } })
        fireEvent.change(stockInput, { target: { value: "10" } })
        fireEvent.change(catagoryInput, { target: { value: "Test Category" } })
        fireEvent.change(descriptionInput, { target: { value: "This is a test product." } })
        fireEvent.click(submitButton)

    })
})