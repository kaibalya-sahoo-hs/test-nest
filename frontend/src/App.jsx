import { useState } from 'react'
import './App.css'
import { CartProvider } from './context/CartContext'
import AllRoute from './routes/AllRoute'

function App() {

  return (
    <CartProvider>
        <AllRoute/>
    </CartProvider>
  )
}

export default App