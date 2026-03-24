import React from 'react'
import toast from 'react-hot-toast'
import {Routes} from 'react-router'

function PublicRoutes({children}) {
    if (localStorage.getItem('token')) {
        toast('You are already loggedin')
        return
    };
  return <React.Fragment>
  {children}
</React.Fragment>
}

export default PublicRoutes