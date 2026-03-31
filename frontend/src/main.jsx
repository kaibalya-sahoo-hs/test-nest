
import { createRoot } from 'react-dom/client'
import { CartProvider } from './context/CartContext'
import './index.css'
import AllRoute from './routes/AllRoute'

createRoot(document.getElementById('root')).render(
    <CartProvider>
        <AllRoute/>
    </CartProvider>
)
