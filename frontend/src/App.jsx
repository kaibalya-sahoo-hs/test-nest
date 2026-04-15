import { useState } from 'react'
import './App.css'
import { CartProvider } from './context/CartContext'
import AllRoute from './routes/AllRoute'

function App() {

  return (
        <AllRoute/>
  )
}

export default App