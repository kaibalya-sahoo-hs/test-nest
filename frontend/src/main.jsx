import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter, Route, Routes} from 'react-router'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import AdminRoutes from './components/AdminRoutes'
import Admin from './pages/Admin'
import UserRoutes from './components/UserRoutes'
import {Toaster} from "react-hot-toast"
import CompleteRegistartion from './pages/CompleteRegistartion'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <Toaster/>
    <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path='/auth/register/complete' element={<CompleteRegistartion/>}/>
        <Route path="/profile" element={<UserRoutes><Profile /></UserRoutes>} />
        <Route path="/admin" element={<AdminRoutes><Admin /></AdminRoutes>} />
        <Route path="/" element={<App/>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
