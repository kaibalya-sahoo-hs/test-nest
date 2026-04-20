import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { createContext, useContext } from "react";
import api from "../utils/api";

const UserContext = createContext();

export function UserProvider({ children }) {
  const userData = localStorage.getItem("user");
  const token = localStorage.getItem("accessToken");

  const user = userData ? JSON.parse(userData) : null;

  const [balance, setBalance] = useState(0);

  const getBalance = async () => {
    try {
      const response = await api.get("/users/balance");
      setBalance(response.data.balance);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  useEffect(() => {
    if(user){
      getBalance();
    }
  }, [token]);

  return (
    <UserContext.Provider value={{ balance, setBalance, user, getBalance }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
