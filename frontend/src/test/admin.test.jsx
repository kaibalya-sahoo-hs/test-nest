import { fireEvent, screen } from "@testing-library/react"
import { beforeEach, describe, expect, test, vi } from "vitest"
import { render } from "../test-utils"
import { updateTestResult } from "../utils/updateSheets"
import { Route, Routes } from "react-router"
import Nav from "../components/Nav"
import Login from "../pages/Login"
import Admin from "../pages/Admin"
import Users from "../pages/Users"
import UserProfile from "../pages/UserProfile"
import VendorManagement from "../pages/VendorManagement"
import AdminOrdersPage from "../pages/Admin/AdminOrdersPage"
import Payments from "../pages/Admin/Payments"

describe('Feature: Admin', () => {

    let emailInput
    let passwordInput
    let loginButton

    beforeEach(() => {

        render(
            <Routes>
                <Route element={<Nav/>}>
                    <Route path="/" element={<Login />} />
                    <Route path="/admin/dashboard" element={<Admin />} />
                    <Route path="/admin/users" element={<Users />} />
                    <Route path="/admin/users/:id" element={<UserProfile />} />
                    <Route path="/admin/vendors" element={<VendorManagement />} />
                    <Route path="/admin/orders" element={<AdminOrdersPage />} />
                    <Route path="/admin/orders/:orderId" element={<Payments/>} />

                </Route>
            </Routes>
        );
        emailInput = screen.getByPlaceholderText(/esteban_schiller@gmail.com/)
        passwordInput = screen.getByPlaceholderText(/••••••/)
        loginButton = screen.getByRole("button", { name: /sign in/i })
    })


    test('Scenario: login', async () => {
        try {
        fireEvent.change(emailInput, { target: { value: "admin@gmail.com" } })
        fireEvent.change(passwordInput, { target: { value: 'admin@123' } })
        fireEvent.click(loginButton)
        const successMessage = await screen.findByText(/Login successful/i)
        expect(successMessage)
        const texts = await screen.findAllByText(/DashBoard/i)
        expect(texts[0])
        const userLink = screen.getByRole('link', {name: /Users/i})
        fireEvent.click(userLink)

        const usersText = await screen.findByText(/Users List/i)
        expect(usersText)

        const users = await screen.findAllByText(/Someone/i)
        expect(users[0])
        users[0].click()

        const userProfile = await screen.findByText(/User Profile/i)
        expect(userProfile)
        screen.debug()

            await updateTestResult('TC_ADMIN_01', 'pass')
        } catch (error) {
            await updateTestResult('TC_ADMIN_01', 'fail')
        }
    });

    // test scneario to delete a user
    test('Scenario: Delete a User', async () => {
        try {
        fireEvent.change(emailInput, { target: { value: "admin@gmail.com" } })
        fireEvent.change(passwordInput, { target: { value: 'admin@123' } })
        fireEvent.click(loginButton)

        const successMessage = await screen.findByText(/Login successful/i)
        expect(successMessage)
        const userLink = await screen.findByRole('link', {name: /Users/i})
        fireEvent.click(userLink)

        const usersText = await screen.findByText(/Users List/i)
        expect(usersText)

        // find  delete button and click on it
        const deleteButtons = await screen.findAllByRole('button', { name: /Delete User/i })
        expect(deleteButtons[deleteButtons.length / 2])
        fireEvent.click(deleteButtons[0])
        screen.debug()
        vi.spyOn(window, 'confirm').mockReturnValue(true);
        const deletedMessage = await screen.findByText(/User deleted successfully/i)
        expect(deletedMessage)
        await updateTestResult('TC_ADMIN_02', 'pass')
        } catch (error) {
            await updateTestResult('TC_ADMIN_02', 'fail')
        }
    });

    // test scenario to select vndors link and check if the vendor management page is displayed and then click on supspend button and click on reapprove button
    test('Scenario: Suspend and Reapprove a Vendor', async () => {
        try {
            fireEvent.change(emailInput, { target: { value: "admin@gmail.com" } })
            fireEvent.change(passwordInput, { target: { value: 'admin@123' } })
            fireEvent.click(loginButton)
    
            const successMessage = await screen.findAllByText(/Login successful/i)
            expect(successMessage[0])
            const vendorLink = await screen.findByRole('link', {name: /Vendors/i})
            fireEvent.click(vendorLink)
    
            const vendorsText = await screen.findByText(/Vendor Management/i)
            expect(vendorsText)
    
            // find  suspend button and click on it
            const suspendButtons = await screen.findAllByRole('button', { name: /suspend vendor/i })
            expect(suspendButtons[0])
            fireEvent.click(suspendButtons[0])
            screen.debug()
            const suspendMessage = await screen.findByText(/Vendor status updated to ['"]?suspended['"]?/i)
            expect(suspendMessage)
    
            // find  reapprove button and click on it
            const reapproveButtons = await screen.findAllByRole('button', { name: /reapprove button/i })
            expect(reapproveButtons[0])
            fireEvent.click(reapproveButtons[0])
            const reapproveMessage = await screen.findByText(/Vendor status updated to ['"]?approved['"]?/i)
            expect(reapproveMessage)
            await updateTestResult('TC_ADMIN_03', 'pass')
        } catch (error) {
            await updateTestResult('TC_ADMIN_03', 'fail')
        }
    });

    test('Scenario: View Orders', async () => {
        try {
            fireEvent.change(emailInput, { target: { value: "admin@gmail.com" } })
            fireEvent.change(passwordInput, { target: { value: 'admin@123' } })
            fireEvent.click(loginButton)
            const successMessage = await screen.findAllByText(/Login successful/i)
            expect(successMessage[0])
            const ordersLink = await screen.findByRole('link', {name: /Orders/i})
            fireEvent.click(ordersLink);
            const ordersText = await screen.findAllByText(/Orders/i)
            expect(ordersText[0])
    
            const viewPaymentLogs = await screen.findByText(/View Payment Logs/i)
            expect(viewPaymentLogs)
            fireEvent.click(viewPaymentLogs)
            screen.debug()
            const paymentLogsText = await screen.findByText(/view logs/i)
            expect(paymentLogsText)
            await updateTestResult('TC_ADMIN_04', 'pass')
        } catch (error) {
            await updateTestResult('TC_ADMIN_04', 'fail')
        }
    });
})