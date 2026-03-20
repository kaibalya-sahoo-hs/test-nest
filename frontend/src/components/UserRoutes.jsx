import React from 'react'

function UserRoutes({children}) {
    const user = localStorage.getItem('user')

  return (
    <div>
        {user ? children : <div>Plase login as a user</div>}
    </div>
  )
}

export default UserRoutes