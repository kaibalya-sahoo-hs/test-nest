import React from 'react'
import toast from 'react-hot-toast'
import { Navigate } from 'react-router'

function UserRoutes({children}) {
    const user = localStorage.getItem('user')
    const token = localStorage.getItem('token')

    if(!token){
      toast('You are not authorized')
      return <Navigate to={'/login'} />
    }

  return (
    <div>
        {children}
    </div>
  )
}

export default UserRoutes