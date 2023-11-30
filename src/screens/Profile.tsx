import { useState } from "react"
import { Alert, TouchableOpacity } from "react-native"
import { Center, Heading, ScrollView, Skeleton, Text, VStack, useToast } from "native-base"
import * as ImagePicker from 'expo-image-picker'
import { Controller, useForm } from "react-hook-form"
import { yupResolver } from '@hookform/resolvers/yup'
import * as FileSystem from 'expo-file-system'
import * as yup from 'yup'

import { useAuthContext } from "@hooks/useAuthContext"

import { api } from "@services/api"
import { AppError } from "@utils/AppError"

import Input from "@components/Input";
import Button from "@components/Button";
import UserPhoto from "@components/UserPhoto";
import ScreenHeader from "@components/ScreenHeader";

import userDefaultPhoto from '@assets/userPhotoDefault.png'


type FormDataProps = {
  name: string
  email?: string
  old_password?: string
  password?: string | null
  passwordConfirm?: string | null
}

const ProfileSchema = yup.object({
  name: yup.string().required('Informe o nome'),
  password: yup
    .string()
    .min(6, 'A senha deve ter 6 digitos pelo menos')
    .nullable()
    .transform( value => !!value ? value : null ),
  passwordConfirm: yup
    .string()
    .nullable()
    .transform( value => !!value ? value : null )
    .oneOf([yup.ref('password')], 'As senhas devem ser iguais.')
    .when('password', {
      is: (Field: any) => Field,
      then: schema => schema
        .nullable()
        .required('Informe a confirmacao de senha')
        .transform( value => !!value ? value : null )
    })
})


const PHOTO_SIZE = 33

export default function Profile(){

  const [isLoading, setIsLoading] = useState(false)

  const { user, updateUserProfile } = useAuthContext()
  
  const { control, handleSubmit, formState: { errors } } = useForm<FormDataProps>({
    defaultValues: {
      name: user.name,
      email: user.email,
    },
    resolver: yupResolver(ProfileSchema),
  })

  const toast = useToast()

  const [photoIsLoading, setPhotoIsLoading] = useState(false)
  const [userPhoto, setUserPhoto] = useState(user.avatar)


  async function handleUserPhotoSelect(){
    setPhotoIsLoading(true)

    try {
      const photoSelected = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        aspect: [4,4],
        allowsEditing: true,
      })
  
      if(photoSelected.canceled){
        return
      }
  
      if(photoSelected.assets[0].uri){
        const photoInfo = await FileSystem
        .getInfoAsync(photoSelected.assets[0].uri) as FileSystem.FileInfo
        
        if(photoInfo.size && (photoInfo.size / 1024 / 1024) > 5){
          return toast.show({
            title: 'Escolha uma imagem de até 5MB.',
            placement: 'top',
            bgColor: 'red.500',
          })
        }

        setUserPhoto(photoSelected.assets[0].uri)

        const fileExtension = photoSelected.assets[0].uri.split('.').pop()

        const photoFile = {
          name: `${user.name}.${fileExtension}`.toLocaleLowerCase(),
          uri: photoSelected.assets[0].uri,
          type: `${photoSelected.assets[0].type}/${fileExtension}`,
        } as any


        const userPhotoUploadForm = new FormData()
        userPhotoUploadForm.append('avatar', photoFile)

        const { data: { avatar } } = await api.patch('users/avatar', userPhotoUploadForm, {
          headers:{
            "Content-Type":"multipart/form-data"
          }
        })

        const updatedUser = user
        updatedUser.avatar = avatar
        updateUserProfile(updatedUser)

        toast.show({
          title: 'Sua foto foi atualizada!',
          placement: 'top',
          bgColor: 'green.700'
        })
      }

    } catch (error) {
      console.log(error)
      
    }finally{
      setPhotoIsLoading(false)
    }
  }


  async function handleProfileUpdate(data: FormDataProps){
    try {
      setIsLoading(true)
      await api.put('users', data)

      const updatedUser = user
      updatedUser.name = data.name

      await updateUserProfile(updatedUser)

      toast.show({
        title: 'Perfil atualizado!',
        placement: 'top',
        bgColor: 'green.700'
      })

    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError ? error.message : 'Não foi possivel atualizar o perfil.'

      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500',
      })

    } finally{
      setIsLoading(false)
    }
  }


  return(
    <VStack
      flex={1}
    >
      <ScreenHeader title="Perfil" />

      <ScrollView
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >
        <Center
          mt={6}
          px={10}
        >
          {
            photoIsLoading ?
            <Skeleton 
              w={PHOTO_SIZE}
              h={PHOTO_SIZE}
              rounded={'full'}
              startColor={'gray.500'}
              endColor={'gray.400'}
            />
            :
            <UserPhoto
              source={
                user.avatar 
                ? { uri: `${api.defaults.baseURL}/avatar/${user.avatar}` } 
                : (userDefaultPhoto)
              }
              alt="Foto do usuario"
              size={PHOTO_SIZE}
            />
          }

          <TouchableOpacity
            onPress={handleUserPhotoSelect}
          >
            <Text
              color={'green.500'}
              fontWeight={'bold'}
              fontSize={'md'}
              mt={2}
              mb={8}
            >
              Alterar Foto
            </Text>
          </TouchableOpacity>


          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <Input 
                bg={'gray.600'}
                placeholder="Nome"
                onChangeText={onChange}
                value={value}
                errorMessage={errors.name?.message}
              />
            )}
          />


          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <Input 
                bg={'gray.600'}
                placeholder="E-mail"
                isDisabled
                isReadOnly
                onChangeText={onChange}
                value={value}
              />
            )}
          />


          <Heading
            color={'gray.200'}
            fontSize={'md'}
            fontFamily={'heading'}
            mb={2}
            mt={6}
            alignSelf={'flex-start'}
          >
            Alterar senha
          </Heading>


          <Controller
            control={control}
            name="old_password"
            render={({ field: { onChange } }) => (
              <Input 
                bg={'gray.600'}
                placeholder="Senha antiga"
                secureTextEntry
                onChangeText={onChange}
              />
            )}
          />


          <Controller
            control={control}
            name="password"
            render={({ field: { onChange } }) => (
              <Input 
                bg={'gray.600'}
                placeholder="Nova senha"
                secureTextEntry
                onChangeText={onChange}
                errorMessage={errors.password?.message}
              />
            )}
          />


          <Controller
            control={control}
            name="passwordConfirm"
            render={({ field: { onChange } }) => (
              <Input 
                bg={'gray.600'}
                placeholder="Confirmar nova senha"
                secureTextEntry
                onChangeText={onChange}
                errorMessage={errors.passwordConfirm?.message}
                onSubmitEditing={handleSubmit(handleProfileUpdate)}
                returnKeyType="send"
              />
            )}
          />


          <Button
            onPress={handleSubmit(handleProfileUpdate)}
            title="Atualizar"
            mt={4}
            isLoading={isLoading}
          />
        </Center>
      </ScrollView>
    </VStack>
  )
}