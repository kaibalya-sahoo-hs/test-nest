import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '../../test-utils';
import App from '../../App';
import Products from '../../pages/Public/Products';

describe('Feature: Cart System', () => {

  test('should add the first product to the cart and verify in cart page', async () => {
    render(<Products />);

    const items = await screen.findAllByAltText(/Product image/i, {exact: false}) 
    fireEvent.click(items[0])
    screen.debug()
    const addToCartButton = await screen.findByRole('button', { name: /Add to cart/i });
    fireEvent.click(addToCartButton);

    // const successToast = await screen.findByText(/Item added to the cart/i);
    // expect(successToast).toBeInTheDocument();

    // const cartLink = screen.getByRole('link', { name: /cart/i });
    // fireEvent.click(cartLink);

    // // 6. Verify if the product is in the list
    // // You can check for a specific test ID or text that usually appears in your cart items
    // const cartItem = await screen.findByTestId('cart-item'); 
    // expect(cartItem).toBeInTheDocument();
  });
});