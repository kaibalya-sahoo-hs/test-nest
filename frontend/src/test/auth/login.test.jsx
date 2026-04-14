import { screen, fireEvent } from '@testing-library/react'
import Login from "../../pages/Login"
import { render } from '../../test-utils';

describe('Feature: Login', () => {

    let emailInput
    let passwordInput
    let loginButton

    beforeEach(() => {

        render(
            <Login />
        );
        emailInput = screen.getByPlaceholderText(/esteban_schiller@gmail.com/)
        passwordInput = screen.getByPlaceholderText(/••••••/)
        loginButton = screen.getByRole("button", { name: /sign in/i })
    })


    test('Scenario: Valid User', async () => {
        fireEvent.change(emailInput, { target: { value: "demo@gmail.com" } })
        fireEvent.change(passwordInput, { target: { value: 'demo@123' } })
        fireEvent.click(loginButton)
        const successMessage = await screen.findByText(/Login successful/i)
        expect(successMessage)
    });

    test('Scenario: Invalid User', async () => {
        const uniqueEmail = `testuser${Date.now()}@gmail.com`;
        fireEvent.change(passwordInput, { target: { value: 'kajshdkagsd' } })
        fireEvent.change(emailInput, { target: { value: uniqueEmail } })
        fireEvent.click(loginButton)
        screen.debug();
        const invalidUser = await screen.findByText(/User does not exist/i, { exact: false })
        expect(invalidUser)
    })

})