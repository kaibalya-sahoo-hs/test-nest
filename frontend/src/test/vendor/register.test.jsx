import { beforeEach, test } from "vitest"
import VendorRegistration from "../../pages/Vendor/VendorRegistration"
import { render } from "../../test-utils"
import { Route, Routes } from "react-router"
import Nav from "../../components/Nav"
import VendorLogin from "../../pages/Vendor/VendorLogin"
import { fireEvent, screen, waitFor } from "@testing-library/react"
import { updateTestResult } from "../../utils/updateSheets"

describe('feature: Vendor', () => {
    let emailInput
    let nameInput
    let passwordInput
    let storeNameInput
    let storeDescriptionInput
    let registerButton

    beforeEach(() => {

        render(
            <Routes>
                <Route path="/" element={<VendorRegistration />} />
                <Route path="/vendor/login" element={<VendorLogin />} />
            </Routes>
        );
        nameInput = screen.getByPlaceholderText(/Enter your name/i)
        emailInput = screen.getByPlaceholderText(/email@store.com/i)
        passwordInput = screen.getByPlaceholderText(/••••••••/i)
        storeNameInput = screen.getByPlaceholderText(/what is your store called/i)
        storeDescriptionInput = screen.getByPlaceholderText(/Briefly describe what you sell/i)
        registerButton = screen.getByRole("button", { name: /create vendor account/i })
    })

    test('Scenario: Vendor Registation', async () => {
        try {
            fireEvent.change(nameInput, { target: { value: "new seller" } })
            fireEvent.change(emailInput, { target: { value: `newseller${Date.now()}@store.com` } })
            fireEvent.change(passwordInput, { target: { value: "newseller@123" } })
            fireEvent.change(storeNameInput, { target: { value: "new seller store" } })
            fireEvent.change(storeDescriptionInput, { target: { value: "new seller store description" } })
            fireEvent.click(registerButton)

            await waitFor(() => {
                expect(screen.getByText(/Registration Successful/i))
                expect(screen.getByText(/Your store is under review/i))
            })
            await updateTestResult("TC_VEN_01", "pass")
        } catch (error) {
            await updateTestResult("TC_VEN_01", "failed")
        }
    })
})