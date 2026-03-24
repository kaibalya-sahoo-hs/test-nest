import React from 'react'
import toast from 'react-hot-toast'
import {Navigate, useNavigate} from 'react-router'

function AdminRoutes({children}) {
    const admin = localStorage.getItem("admin")
    if(!admin){
      console.log("Called")
      toast('You are not the admin')
      return <Navigate to={'/profile'}/>
    }
  return (
    <>
        {children}
    </>
  )
}

export default AdminRoutes