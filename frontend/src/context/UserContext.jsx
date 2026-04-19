import React from 'react'
import { useState } from 'react'
import { useEffect } from 'react'
import { createContext, useContext } from 'react'
import api from '../utils/api'

const UserContext = createContext()

export function UserProvider({children}) {

  const [balance, setBalance] = useState(0)


  return (
    <UserContext.Provider value={{balance, setBalance}}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext) 