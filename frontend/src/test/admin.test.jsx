import { fireEvent, screen } from "@testing-library/react"
import Login from "../pages/Login"
import { beforeEach, describe, expect, test } from "vitest"
import { render } from "../test-utils"
import { updateTestResult } from "../utils/updateSheets"
import Admin from "../pages/Admin"
import { Route, Routes } from "react-router"
import Nav from "../components/Nav"
import App from "../App"

describe('Feature: Login', () => {

    let emailInput
    let passwordInput
    let loginButton

    beforeEach(() => {

        render(
             <App/>, {initialEntries: ["/login"],}
        );
        emailInput = screen.getByPlaceholderText(/esteban_schiller@gmail.com/)
        passwordInput = screen.getByPlaceholderText(/••••••/)
        loginButton = screen.getByRole("button", { name: /sign in/i })
    })


    test('Scenario: Valid User', async () => {
        // try {
            screen.debug()
            fireEvent.change(emailInput, { target: { value: "admin@gmail.com" } })
            fireEvent.change(passwordInput, { target: { value: 'admin@123' } })
            fireEvent.click(loginButton)
            const successMessage = await screen.findByText(/Login successful/i)
            screen.debug()
            const NavText = await screen.findByText(/DashBoard/i)
            expect(successMessage)
            expect(NavText)
        //     await updateTestResult('TC_LOG_01', 'pass')
        // } catch (error) {
        //     await updateTestResult('TC_LOG_01', 'fail')
        // }
    });
})