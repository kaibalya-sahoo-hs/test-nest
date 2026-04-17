import { beforeEach, describe, test } from "vitest";
import { render } from "../../test-utils";
import { Route, Routes } from "react-router";
import Nav from "../../components/Nav";
import OrdersPage from "../../pages/OrdersPage";
import userEvent from "@testing-library/user-event";
import Login from "../../pages/Login";
import Profile from "../../pages/Profile";
import { findByAltText, fireEvent, screen, waitFor } from "@testing-library/react"
import { updateTestResult } from "../../utils/updateSheets";

describe('feature: User Orders', () => {
    let emailInput
    let passwordInput
    let loginButton
    let loginPageButton
    const user  = userEvent.setup()
    beforeEach(async () => {
        render(
            <Routes>
                <Route element={<Nav />} >
                    <Route path="/" element={<Login />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/orders" element={<OrdersPage/>}/>
                </Route>
            </Routes>
        )
        emailInput = screen.getByPlaceholderText(/esteban_schiller@gmail.com/i)
        passwordInput = screen.getByPlaceholderText(/••••••/i)
        loginButton = screen.getByRole("button", { name: /sign in/i })

        fireEvent.change(emailInput, { target: { value: `demo@gmail.com` } })
        fireEvent.change(passwordInput, { target: { value: "demo@123" } })
        fireEvent.click(loginButton)
        const welcomeText = await screen.findAllByText(/login successful/i)
        expect(welcomeText[0])

        screen.debug()
        const profile = await screen.findByAltText('profile')
        fireEvent.click(profile)

        const profileTexts = await screen.findAllByText(/profile/i)
        expect(profileTexts[0])

        fireEvent.click(profileTexts[0])

        const ordersText = await screen.findByText(/orders/i)
        expect(ordersText)
        await user.click(ordersText, { pointerEventsCheck: 0 })
    })
    test('Scenario: User can view order history', async () => {
        try {
            const ordersText = await screen.findByText(/My Orders/i)
            expect(ordersText)
            await updateTestResult('TC_USER_05', 'pass')
        } catch (error) {
            await updateTestResult('TC_USER_05', 'fail')
        }
    })
    // test('Scenario: User can view order details', async () => {})
})