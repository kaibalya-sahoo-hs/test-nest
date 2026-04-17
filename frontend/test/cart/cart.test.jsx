import { screen, fireEvent, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router';
import { beforeEach, expect } from 'vitest';
import Products from '../../src/pages/Public/Products';
import ProductPage from '../../src/pages/ProductPage';
import CartPage from '../../src/pages/CartPage';
import { updateTestResult } from '../../src/utils/updateSheets';
import { render } from '../test-utils';

describe('Feature: Cart System', () => {

  beforeEach(() => {

    render(
      <>
        <Routes>
          <Route path="/" element={<Products />} />
          <Route path="/products/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </>
    );
  })
  test('should add the first product to the cart and verify in cart page', async () => {

    try {
      const items = await screen.findAllByAltText(/Product image/i, { exact: false })
      fireEvent.click(items[0])
      const addToCartBtn = await screen.findByRole('button', { name: /add to cart/i })
      fireEvent.click(addToCartBtn)
      const viewCartButton = await screen.findByRole('button', { name: /View Cart/i });
      fireEvent.click(viewCartButton)

      await screen.findAllByText(/Shopping Cart/)
      const cartItems = await screen.findAllByAltText(/Product image/i, { exact: false })
      expect(cartItems[0])
      await updateTestResult('TC_CART_01', 'pass')
    } catch (error) {
      await updateTestResult('TC_CART_01', 'fail')

    }
  });

  test('Update cart items', async () => {
    try {
    const items = await screen.findAllByAltText(/Product image/i, { exact: false })
    fireEvent.click(items[0])
    const addToCartBtn = await screen.findByRole('button', { name: /add to cart/i })
    fireEvent.click(addToCartBtn)

    await screen.findByText(/1/)

    const buttons = screen.getAllByRole('button');

    const minusBtn = buttons.find(btn =>
      btn.innerHTML.includes('M432 256')
    );

    const plusBtn = buttons.find(btn =>
      btn.innerHTML.includes('M256 80')
    );
    fireEvent.click(plusBtn)

    const increasedQuantity = await screen.findByText(/2/)
    expect(increasedQuantity)

    fireEvent.click(minusBtn)

    const decreasedQuantity = await screen.findByText(/1/)
    expect(decreasedQuantity)

      await updateTestResult('TC_CART_02', 'pass')
    } catch (error) {
      await updateTestResult('TC_CART_02', 'fail')
    }
  })

  test('Rmove item from cart', async () => {

    try {
    screen.debug()
    const items = await screen.findAllByAltText(/Product image/i, { exact: false })
    fireEvent.click(items[0])
    const addToCartBtn = await screen.findByRole('button', { name: /add to cart/i })
    fireEvent.click(addToCartBtn)
    const viewCartButton = await screen.findByRole('button', { name: /View Cart/i });
    fireEvent.click(viewCartButton)

    await screen.findAllByText(/Shopping Cart/)
    const cartItems = await screen.findAllByAltText(/Product image/i, { exact: false })
    expect(cartItems[0])

    const removeBtn = await screen.findByRole('button', { name: /remove item/i })
    fireEvent.click(removeBtn)

    const emptyText = await screen.findByText(/Your cart is empty/i)
    expect(emptyText)
      await updateTestResult('TC_CART_03', 'pass')
    } catch (error) {
      await updateTestResult('TC_CART_03', 'fail')

    }
  });

});