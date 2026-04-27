import { screen, fireEvent } from '@testing-library/react'
import Register from '../../src/pages/Register'
import { render } from '../test-utils'
import { updateTestResult } from '../../src/utils/updateSheets'

describe('Feature: Registartion', () => {

  let nameInput
  let emailInput
  let registerButton

  beforeEach(() => {

    render(
      <Register />
    );
    nameInput = screen.getByPlaceholderText(/Enter your full name/)
    emailInput = screen.getByPlaceholderText(/Enter your email/)
    registerButton = screen.getByRole("button", { name: /Create Account/i })
  })


  test.only('Scenario: Brand New User', async () => {
    try {
      const uniqueEmail = `testuser${Date.now()}@gmail.com`;
      fireEvent.change(nameInput, { target: { value: "someone" } })
      fireEvent.change(emailInput, { target: { value: uniqueEmail } })
      fireEvent.click(registerButton)
      const successMessage = await screen.findByText(/Registration link sent! Please check your email/)
      await updateTestResult("TC_REG_01", "pass")
      expect(successMessage)
    } catch (error) {
      await updateTestResult("TC_REG_01", "fail")
      
    }
  });

  test.only('Scenario: Duplicate User', async () => {
    try {
      fireEvent.change(emailInput, { target: { value: "random" } })
      fireEvent.click(registerButton)
      screen.debug();
      const invalidemailmessage = await screen.findByText(/Enter a valid email address/i, { exact: false })
      expect(invalidemailmessage)
      await updateTestResult("TC_REG_02", "pass")
    } catch (error) {
      await updateTestResult("TC_REG_02", "fail")
      
    }
  })

  test('Scenario: Empty Fields', async () => {
    try {
      fireEvent.click(registerButton)
      screen.debug();
      const invalidemailmessage = await screen.findByText(/Email is required/i, { exact: false })
      const invalidNameMessage = await screen.findByText(/Name is required/i, { exact: false })
  
      expect(invalidemailmessage)
      expect(invalidNameMessage)
      await updateTestResult("TC_REG_03", "pass")
    } catch (error) {
      await updateTestResult("TC_REG_03", "fail")
      
    }
  })
  
})