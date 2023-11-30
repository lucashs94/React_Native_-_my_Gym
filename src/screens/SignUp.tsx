import { Center, Heading, Image, Text, VStack, ScrollView, useToast } from "native-base"
import { useNavigation } from "@react-navigation/native"
import { Controller, useForm } from "react-hook-form"
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'

import Logo from '@assets/logo.svg'
import bgImg from '@assets/background.png'

import { AuthNavigatorRoutesProps } from "@routes/auth.routes"

import Input from "@components/Input";
import Button from "@components/Button";
import { api } from "@services/api"
import { AppError } from "@utils/AppError"
import { useState } from "react"
import { isLoading } from "expo-font"
import { useAuthContext } from "@hooks/useAuthContext"


type FormDataProps = {
  name: string
  email: string
  password: string
  passwordConfirm: string
}

const signUpSchema = yup.object({
  name: yup.string().required('Informe o nome'),
  email: yup.string().required('Informe o email').email('Informe um email válido'),
  password: yup.string().required('Informe a senha').min(6, 'A senha deve ter 6 digitos'),
  passwordConfirm: yup.string().required('Confirme a senha').oneOf([yup.ref('password')], 'As senhas devem ser iguais.'),
})

export default function SignUp(){

  const [isLoading, setIsLoading] = useState(false)

  const { signIn } = useAuthContext()
  const { navigate } = useNavigation<AuthNavigatorRoutesProps>()
  const toast = useToast()

  const { 
    control, 
    handleSubmit, 
    reset,
    formState: { errors } 
  } = useForm<FormDataProps>({ resolver: yupResolver(signUpSchema) })


  function handleGoToLogin(){
    navigate('signIn')
  }


  async function handleSignUp({ name, email, password }: FormDataProps){

    try {
      setIsLoading(true)

      await api.post('users', { name, email, password })
      await signIn(email, password)
      
    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError ? error.message : 'Não foi possivel criar a conta!'

      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500',
      })

    } finally{
      setIsLoading(false)

      reset({
        name: '',
        email: '',
        password: '',
        passwordConfirm: '',
      })
    }
  }


  return(
    <ScrollView
      contentContainerStyle={{ flexGrow: 1,}}
      showsVerticalScrollIndicator={false}
    >
      <VStack
        flex={1}
        px={10}
        pb={12}
      >
        <Image
          source={bgImg}
          defaultSource={bgImg}
          alt="Imagem de fundo"
          resizeMode="contain"
          position={'absolute'}
        />

        <Center my={16}>
          <Logo/>

          <Text color='gray.100' fontSize='sm'>
            Treine sua mente e o seu corpo
          </Text>
        </Center>

        <Center>
          <Heading 
            color='gray.100' 
            fontSize='xl' 
            fontFamily='heading'
            mb={6} 
          >
            Crie sua conta
          </Heading>


          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <Input 
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
            render={({ field: { onChange, value }}) => (
              <Input 
                placeholder="E-mail" 
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={onChange}
                value={value}
                errorMessage={errors.email?.message}
              />
            )}
          />


          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <Input 
                placeholder="Senha" 
                secureTextEntry
                autoCapitalize="none"
                onChangeText={onChange}
                value={value}
                errorMessage={errors.password?.message}
              />
            )}
          />


          <Controller
            control={control}
            name="passwordConfirm"
            render={({ field: { onChange, value } }) => (
              <Input 
                placeholder="Confirme a senha" 
                onChangeText={onChange}
                value={value}
                secureTextEntry
                autoCapitalize="none"
                onSubmitEditing={handleSubmit(handleSignUp)}
                returnKeyType="send"
                errorMessage={errors.passwordConfirm?.message}
              />
            )}
          />


          <Button 
            title='Criar e acessar'
            onPress={handleSubmit(handleSignUp)}
            isLoading={isLoading}
          />
          
        </Center>

        <Center mt={Object.keys(errors).length > 0 ? 8 : 24}>
          <Button
            title='Voltar para o login'
            variant={'outline'}
            onPress={handleGoToLogin}
          />
        </Center>

      </VStack>
    </ScrollView>
  )
}