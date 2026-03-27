import React from 'react'
import { Toaster } from 'react-hot-toast'
import { BrowserRouter, Route, Routes } from 'react-router'
import Nav from '../components/Nav'
import Admin from '../pages/Admin'
import ApiLogs from '../pages/ApiLogs'
import FavoritesPage from '../pages/FavoritesPage'
import Login from '../pages/Login'
import Products from '../pages/Products'
import ProductStock from '../pages/ProductStock'
import Profile from '../pages/Profile'
import Register from '../pages/Register'
import Stats from '../pages/Stats'
import Users from '../pages/Users'
import CompleteRegistration from '../pages/CompleteRegistartion'
import UserNav from '../components/UserRoutes'
function AllRoute() {
  const userData=  localStorage.getItem('user')
    return (
        <BrowserRouter>
                <Toaster />

                    <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path='/auth/register/complete' element={<CompleteRegistration />} />
                    <Route path="/profile" element={<UserNav userData={userData}><Profile /></UserNav>} />
                    <Route path="/admin/dashboard" element={<Nav><Admin /></Nav>} />
                    <Route path='/admin/apilogs' element={<Nav><ApiLogs /></Nav>} />
                    <Route path='/admin/charts' element={<Nav><Stats /></Nav>} />
                    <Route path='/admin/products' element={<Nav><Products /></Nav>} />
                    <Route path='/admin/favourites' element={<Nav><FavoritesPage /></Nav>} />
                    <Route path='/admin/stock' element={<Nav><ProductStock /></Nav>} />
                    <Route path='/admin/users' element={<Nav><Users /></Nav>} />
                    
            </Routes>
    </BrowserRouter >
  )
}

export default AllRoute