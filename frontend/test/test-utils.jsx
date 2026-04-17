import { render } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router';
import { CartProvider } from '../src/context/CartContext';
import { vi } from 'vitest';
import { Toaster } from 'react-hot-toast';
import AllRoutes from "../src/routes/AllRoute"

global.window.Razorpay = vi.fn().mockImplementation(function () {
  return {
    open: vi.fn(),
    on: vi.fn(),
  };
});

if (typeof window !== 'undefined') {
  const storage = {};
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn((key) => (key in storage ? storage[key] : null)),
      setItem: vi.fn((key, value) => {
        storage[key] = String(value);
      }),
      removeItem: vi.fn((key) => {
        delete storage[key];
      }),
      clear: vi.fn(() => {
        Object.keys(storage).forEach((key) => delete storage[key]);
      }),
    },
    writable: true,
  });

  const sessionStorageData = {};
  Object.defineProperty(window, 'sessionStorage', {
    value: {
      getItem: vi.fn((key) => (key in sessionStorageData ? sessionStorageData[key] : null)),
      setItem: vi.fn((key, value) => {
        sessionStorageData[key] = String(value);
      }),
      removeItem: vi.fn((key) => {
        delete sessionStorageData[key];
      }),
      clear: vi.fn(() => {
        Object.keys(sessionStorageData).forEach((key) => delete sessionStorageData[key]);
      }),
    },
    writable: true,
  });

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // Deprecated
      removeListener: vi.fn(), // Deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

const customRender = (ui, options) =>
  render(ui, {
    wrapper: ({ children }) => (
      <CartProvider>
        <Toaster/>
        <MemoryRouter>
          {children}
        </MemoryRouter>
      </CartProvider>
    ),
    ...options,
  });

export * from '@testing-library/react';
export { customRender as render };