import { Route, Routes } from "react-router"
import { render } from "../../test-utils"
import { beforeEach, describe, expect, test } from "vitest"
import VendorDashboard from "../../pages/Vendor/VendorDashboard"
import VendorLogin from "../../pages/Vendor/VendorLogin"
import VendorProducts from "../../pages/Vendor/VendorProducts"
import { fireEvent, screen, waitFor } from "@testing-library/react"
import Nav from "../../components/Nav"
import userEvent from '@testing-library/user-event';
import VendorOrders from "../../pages/Vendor/VendorOrders"

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
                    <Route path="/vendor/orders" element={<VendorOrders />} />
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
        const productsLink = await screen.findByRole('link', { name: /Orders/i })
        fireEvent.click(productsLink)

    })
    test('Scenario: Vendor can view orders', async () => {
        await screen.findByText(/Track and manage your store orders/i)
    })
})