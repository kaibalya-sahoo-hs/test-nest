import React from 'react'
import { useState } from 'react'
import { useEffect } from 'react'
import { createContext, useContext } from 'react'
import api from '../utils/api'

const ProductContext = createContext(null)

export function ProductProvider({children}) {

  const [searchedProduct, setSearchedProduct] = useState([])

  const searchForProducts = async (name) => {
    const {data} = await api.get(`/products/search/${name}`)
    if(data.success){
      searchForProducts(data.products)
    }
  } 

  return (
    <ProductContext.Provider value={{searchedProduct, searchForProducts}}>
      {children}
    </ProductContext.Provider>
  )
}

export const useProduct = useContext(ProductContext) 