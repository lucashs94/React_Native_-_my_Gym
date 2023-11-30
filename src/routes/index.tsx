import { NavigationContainer, DefaultTheme }  from '@react-navigation/native'
import { Box, useTheme } from 'native-base'

import AuthRoutes from './auth.routes'
import { AppRoutes } from './app.routes'
import { useAuthContext } from '@hooks/useAuthContext'
import Loading from '@components/Loading'



export default function Routes(){

  const { user, isLoadingAuth } = useAuthContext()
  const { colors } = useTheme()

  const theme = DefaultTheme
  theme.colors.background = colors.gray[700]


  if(isLoadingAuth){
    return <Loading />
  }


  return(
    <Box flex={1} bg={'gray.700'}>
      <NavigationContainer theme={theme}>

        {user.id ? <AppRoutes/> : <AuthRoutes />}
        
      </NavigationContainer>
    </Box>
  )
}