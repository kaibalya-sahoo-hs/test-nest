import { screen, fireEvent } from '@testing-library/react'
import App from '../../src/App'
import { updateTestResult } from '../../src/utils/updateSheets'
import Login from '../../src/pages/Login'
import { render } from '../test-utils'
import { Route, Routes } from 'react-router'

describe('Feature: Login', () => {

    let emailInput
    let passwordInput
    let loginButton

    beforeEach(() => {

        render(
            <Routes>
                <Route path='/' element={<Login />}/>
            </Routes>    
        );
        emailInput = screen.getByPlaceholderText(/esteban_schiller@gmail.com/)
        passwordInput = screen.getByPlaceholderText(/••••••/)
        loginButton = screen.getByRole("button", { name: /sign in/i })
    })


    test('Scenario: Valid User', async () => {
        // try {
            fireEvent.change(emailInput, { target: { value: "admin@gmail.com" } })
            fireEvent.change(passwordInput, { target: { value: 'admin@123' } })
            fireEvent.click(loginButton)
            screen.debug()
            const successMessage = await screen.findByText(/Login successful/i)
            const NavText = await screen.findByText(/DashStack/i)
            expect(successMessage)
            expect(NavText)
            await updateTestResult('TC_LOG_01', 'pass')
        // } catch (error) {
        //     await updateTestResult('TC_LOG_01', 'fail')
        // }
    });

    test('Scenario: Invalid User', async () => {
        try {
            const uniqueEmail = `testuser${Date.now()}@gmail.com`;
            fireEvent.change(passwordInput, { target: { value: 'kajshdkagsd' } })
            fireEvent.change(emailInput, { target: { value: uniqueEmail } })
            fireEvent.click(loginButton)
            const invalidUser = await screen.findByText(/User does not exist/i, { exact: false })
            expect(invalidUser)
            await updateTestResult('TC_LOG_02', 'pass')
        } catch (error) {
            await updateTestResult('TC_LOG_02', 'fail')
        }
    })

     test('Scenario: Wrong password', async () => {
        try {
            fireEvent.change(emailInput, { target: { value: "demo@gmail.com" } })
            fireEvent.change(passwordInput, { target: { value: 'randomtext@$%^&' } })
            fireEvent.click(loginButton)
            const WrongPassword = await screen.findByText(/Wrong Password/i, { exact: false })
            expect(WrongPassword)
            await updateTestResult('TC_LOG_03', 'pass')
        } catch (error) {
            await updateTestResult('TC_LOG_03', 'fail')
        }
    })

})