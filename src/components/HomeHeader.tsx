import { TouchableOpacity } from "react-native"
import { HStack, Heading, Icon, Text, VStack } from "native-base"
import { MaterialIcons } from '@expo/vector-icons'

import { useAuthContext } from "@hooks/useAuthContext"

import UserPhoto from "./UserPhoto"

import userDefaultPhoto from '@assets/userPhotoDefault.png'
import { api } from "@services/api"


export default function HomeHeader(){

  const { user, signOut } = useAuthContext()

  return(
    <HStack
      bg={'gray.600'}
      pt={16}
      pb={5}
      px={8}
      alignItems={'center'}
    >
      <UserPhoto 
        source={
        user.avatar 
          ? { uri: `${api.defaults.baseURL}/avatar/${user.avatar}` } 
          : (userDefaultPhoto)
      }
        alt="Foto do usuario"
        size={16}
        mr={4}
      />

      <VStack
        flex={1}
      >
        <Text
          color={'gray.100'}
          fontSize={'md'}
        >
          Olá,
        </Text>
        <Heading
          color={'gray.100'}
          fontSize={'md'}
          fontFamily={'heading'}
        >
          {user.name}
        </Heading>
      </VStack>

      <TouchableOpacity
        onPress={signOut}
      >
        <Icon
          as={MaterialIcons}
          name="logout"
          color={'gray.200'}
          size={7}
        />
      </TouchableOpacity>

    </HStack>
  )
}