import { screen, fireEvent } from '@testing-library/react'
import Register from "../../pages/Register"
import { render } from '../../test-utils';

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


  test('Scenario: Brand New User', async () => {
    const uniqueEmail = `testuser${Date.now()}@gmail.com`;
    fireEvent.change(nameInput, { target: { value: "someone" } })
    fireEvent.change(emailInput, { target: { value: uniqueEmail } })
    fireEvent.click(registerButton)
    const successMessage = await screen.findByText(/Registration link sent! Please check your email/)
    expect(successMessage)
  });

  test('Scenario: Duplicate User', async () => {
    fireEvent.change(emailInput, { target: { value: "random" } })
    fireEvent.click(registerButton)
    screen.debug();
    const invalidemailmessage = await screen.findByText(/Enter a valid email address/i, { exact: false })
    expect(invalidemailmessage)
  })

  test('Scenario: Empty Fields', async () => {
    fireEvent.click(registerButton)
    screen.debug();
    const invalidemailmessage = await screen.findByText(/Email is required/i, { exact: false })
    const invalidNameMessage = await screen.findByText(/Name is required/i, { exact: false })

    expect(invalidemailmessage)
    expect(invalidNameMessage)
  })
  
})