import React from 'react'
import {useNavigate} from 'react-router'

function AdminRoutes({children}) {
    const admin = localStorage.getItem("admin")
  return (
    <>
        {admin ? children : <div>Yu are not the admin</div>}
    </>
  )
}

export default AdminRoutes