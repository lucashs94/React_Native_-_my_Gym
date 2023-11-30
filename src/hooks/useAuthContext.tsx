import { AuthContext } from "@contexts/AuthContexts";
import { useContext } from "react";


export function useAuthContext(){
  return useContext(AuthContext)
}