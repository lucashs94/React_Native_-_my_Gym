import { UserDTO } from "@dtos/UserDTO"
import { api } from "@services/api"
import { storageAuthTokenGet, storageAuthTokenRemove, storageAuthTokenSave } from "@storage/storageAuthToken"
import { storageUserGet, storageUserRemove, storageUserSave } from "@storage/storageUser"
import { ReactNode, createContext, useEffect, useState } from "react"


export type AuthContextDataProps = {
  user: UserDTO
  updateUserProfile: (userUpdate: UserDTO) => Promise<void>
  isLoadingAuth: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

type AuthContextProviderProps = {
  children: ReactNode
}

export const AuthContext = createContext<AuthContextDataProps>({} as AuthContextDataProps)


export function AuthContextProvider({ children }: AuthContextProviderProps){

  const [user, setUser] = useState<UserDTO>({} as UserDTO)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)


  async function userAndTokenUpdate(userData: UserDTO, token: string){
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`

    setUser(userData)
  }


  async function storageUserAndTokenSave(userData: UserDTO, token: string, refresh_token: string){
    try {
      setIsLoadingAuth(true)

      await storageUserSave(userData)
      await storageAuthTokenSave({ token, refresh_token }) 

    } catch (error) {
      throw error

    } finally{
      setIsLoadingAuth(false)
    }
  }


  async function signIn(email: string, password: string){
    
    try {
      setIsLoadingAuth(true)

      const { data } = await api.post('sessions', {
        email,
        password,
      })
  
      if(data.user && data.token && data.refresh_token){
        
        await storageUserAndTokenSave(data.user, data.token, data.refresh_token)
        userAndTokenUpdate(data.user, data.token)
      } 

    } catch (error) {
      throw error

    } finally{
      setIsLoadingAuth(false)
    }
  }


  async function signOut(){
    try {
      setIsLoadingAuth(true)

      setUser({} as UserDTO)
      await storageUserRemove()
      await storageAuthTokenRemove()

    } catch (error) {
      throw error

    } finally{
      setIsLoadingAuth(false)
    }
  }


  async function loadUserData(){
    try {
      setIsLoadingAuth(true)

      const loggedUser = await storageUserGet()
      const { token } = await storageAuthTokenGet()

      if(token && loggedUser){
        userAndTokenUpdate(loggedUser, token)
      }

    } catch (error) {
      throw error

    } finally{
      setIsLoadingAuth(false)
    }
  }


  async function updateUserProfile(userUpdate: UserDTO){
    try {
      setUser(userUpdate)
      await storageUserSave(userUpdate)

    } catch (error) {
      throw error
    }
  }


  useEffect(() => {
    loadUserData()

  }, [])


  useEffect(() => {
    const subscribe = api.registerInterceptorTokenManager(signOut)

    return () => {
      subscribe
    }
  }, [signOut])


  return(
    <AuthContext.Provider
      value={{
        user,
        updateUserProfile,
        isLoadingAuth,
        signIn,
        signOut,
      }}
    >
      { children }
    </AuthContext.Provider>
  )
}