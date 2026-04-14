import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { CartProvider } from './context/CartContext';
import { vi } from 'vitest';
import { Toaster } from 'react-hot-toast';

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    },
    writable: true,
  });
  Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
}

const customRender = (ui, options) =>
  render(ui, {
    wrapper: ({ children }) => (
      <CartProvider>
        <MemoryRouter>
          <Toaster/>
          {children}
        </MemoryRouter>
      </CartProvider>
    ),
    ...options,
  });

export * from '@testing-library/react';
export { customRender as render };