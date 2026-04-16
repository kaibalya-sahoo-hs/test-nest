import { beforeEach, expect, test } from "vitest"
import VendorRegistration from "../../pages/Vendor/VendorRegistration"
import { render } from "../../test-utils"
import { Route, Routes } from "react-router"
import Nav from "../../components/Nav"
import VendorLogin from "../../pages/Vendor/VendorLogin"
import { fireEvent, screen, waitFor } from "@testing-library/react"
import VendorDashboard from "../../pages/Vendor/VendorDashboard"
import { updateTestResult } from "../../utils/updateSheets"

describe('feature: Vendor Login', () => {
    let emailInput
    let passwordInput
    let loginButton

    beforeEach(() => {

        render(
            <Routes>
                <Route path="/" element={<VendorLogin />} />
                <Route path="/vendor/dashboard" element={<VendorDashboard />} />
            </Routes>
        );
        emailInput = screen.getByPlaceholderText(/name@store.com/i)
        passwordInput = screen.getByPlaceholderText(/••••••••/i)
        loginButton = screen.getByRole("button", { name: /vendor-signin/i })
    })

    test('Scenario: Vendor Login', async () => {
        try {
            fireEvent.change(emailInput, { target: { value: `seller1@gmail.com` } })
            fireEvent.change(passwordInput, { target: { value: "seller1" } })
            fireEvent.click(loginButton)

            await waitFor(() => {
                expect(screen.getByText(/Welcome to your dashboard/i))
                expect(screen.getByText(/Welcome back, Seller/i))
            })
            await updateTestResult("TC_VEN_02", "pass")

        } catch (error) {
            await updateTestResult("TC_VEN_02", "failed")
        }
    })
})