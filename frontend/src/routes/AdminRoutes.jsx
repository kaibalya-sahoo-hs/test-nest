import React from 'react'
import { Route, Routes } from 'react-router'
import Admin from '../pages/Admin'
import ApiLogs from '../pages/ApiLogs'
import FavoritesPage from '../pages/FavoritesPage'
import Products from '../pages/Products'
import ProductStock from '../pages/ProductStock'
import Stats from '../pages/Stats'
import Users from '../pages/Users'

function AdminRoutes() {
  return (
    <>
    <Route>

<Route path="/admin/dashboard" element={<Admin />} />
<Route path='/admin/apilogs' element={<ApiLogs />} />
<Route path='/admin/charts' element={<Stats />} />
<Route path='/admin/products' element={<Products />} />
<Route path='/admin/favourites' element={<FavoritesPage />} />
<Route path='/admin/stock' element={<ProductStock />} />
<Route path='/admin/users' element={<Users />} />
</Route>
    </>
  )
}

export default AdminRoutes