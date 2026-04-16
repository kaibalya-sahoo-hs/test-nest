import { Route, Routes } from "react-router"
import { beforeEach, describe, expect, test } from "vitest"
import { findByAltText, fireEvent, screen, waitFor } from "@testing-library/react"
import userEvent from '@testing-library/user-event';
import AddressManager from "../../pages/User/AddressManager";
import Profile from "../../pages/Profile";
import {render} from "../../test-utils";
import Nav from "../../components/Nav";
import Index from "../../pages/Index";
import Login from "../../pages/Login";


describe('feature: Vendor Products', () => {
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
                    <Route path="/address" element={<AddressManager/>}/>
                </Route>
            </Routes>
        )
        emailInput = screen.getByPlaceholderText(/esteban_schiller@gmail.com/i)
        passwordInput = screen.getByPlaceholderText(/••••••/i)
        loginButton = screen.getByRole("button", { name: /sign in/i })

        fireEvent.change(emailInput, { target: { value: `demo@gmail.com` } })
        fireEvent.change(passwordInput, { target: { value: "demo@123" } })
        fireEvent.click(loginButton)
        const welcomeText = await screen.findByText(/login successful/i)
        expect(welcomeText)

        screen.debug()
        const profile = await screen.findByAltText('profile')
        fireEvent.click(profile)

        const profileTexts = await screen.findAllByText(/profile/i)
        expect(profileTexts[0])

        fireEvent.click(profileTexts[0])

        const addressText = await screen.findByText(/address/i)
        expect(addressText)
        await user.click(addressText, { pointerEventsCheck: 0 })
    })

    
    test('Scenario: User can view addresses', async () => {
        const myAddressesText = await screen.findByText(/My Addresses/i)
        expect(myAddressesText)
    })


    

    test('Scenario: User can add a new address', async () => {
        const myAddressesText = await screen.findByText(/My Addresses/i)
        expect(myAddressesText)



        const addAddressButton = await screen.findByRole('button', { name: /add-btn/i })
        await user.click(addAddressButton, { pointerEventsCheck: 0 })

        const addNewAddressText = await screen.findAllByText(/Add New Address/i)
        expect(addNewAddressText[1])
        const nameInput = await screen.findByPlaceholderText(/Full Name/i)
        expect(nameInput)
        fireEvent.change(nameInput, { target: { value: "John Doe" } })

        const phoneInput = await screen.findByPlaceholderText(/Phone Number/i)
        expect(phoneInput)
        fireEvent.change(phoneInput, { target: { value: "123-456-7890" } })

        const addressInput = await screen.findByPlaceholderText(/Street Address/i)
        expect(addressInput)
        fireEvent.change(addressInput, { target: { value: "123 Main St, Springfield" } })

        const cityInput = await screen.findByPlaceholderText(/City/i)
        expect(cityInput)
        fireEvent.change(cityInput, { target: { value: "Springfield" } })

        const stateInput = await screen.findByPlaceholderText(/State/i)
        expect(stateInput)
        fireEvent.change(stateInput, { target: { value: "IL" } })

        const zipCodeInput = await screen.findByPlaceholderText(/postal Code/i)
        expect(zipCodeInput)
        fireEvent.change(zipCodeInput, { target: { value: "627054" } })

        const homeTypeRadio = await screen.findByRole('radio', { name: /home/i })
        expect(homeTypeRadio)
        fireEvent.click(homeTypeRadio)


        const defaultCheckbox = await screen.findByRole('checkbox', { name: /set as default address/i })
        expect(defaultCheckbox)
        fireEvent.click(defaultCheckbox)


        const saveButton = await screen.findByRole('button', { name: /save/i })
        expect(saveButton)
        fireEvent.click(saveButton)
        screen.debug()
    })

})