import { Center, Heading, Image, Text, VStack, ScrollView, useToast } from "native-base";
import { useNavigation } from "@react-navigation/native"
import { Controller, useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from 'yup'

import { AuthNavigatorRoutesProps } from "@routes/auth.routes"

import Input from "@components/Input"
import Button from "@components/Button"

import Logo from '@assets/logo.svg'
import bgImg from '@assets/background.png'
import { useAuthContext } from "@hooks/useAuthContext";
import { AppError } from "@utils/AppError";
import { useState } from "react";


type FormDataProps = {
  email: string
  password: string
}

const signInSchema = yup.object({
  email: yup.string().required('Informe o email').email('Informe um email válido'),
  password: yup.string().required('Informe a senha').min(6, 'A senha deve ter 6 digitos'),
})


export default function SignIn(){

  const [isLoading, setIsLoading] = useState(false)

  const { signIn } = useAuthContext()
  const { navigate } = useNavigation<AuthNavigatorRoutesProps>()
  const toast = useToast()

  const { 
    control, 
    handleSubmit, 
    reset,
    formState: { errors } 
  } = useForm<FormDataProps>({ resolver: yupResolver(signInSchema)})


  function handleNewAccount(){
    navigate('signUp')
  }


  async function handleSignIn({ email, password }: FormDataProps){
    setIsLoading(true)
    
    try {
      await signIn(email, password)

    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError ?  error.message :  'Não foi possivel logar. Tente novamente mais tarde!'

      setIsLoading(false)

      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500',
      })
    }
    
    // reset({
    //   email: '',
    //   password: '',
    // })
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

        <Center my={24}>
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
            Acesse sua conta
          </Heading>


          <Controller
            control={control}
            name="email"
            render={({ field: { value, onChange }}) => (
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
            render={({ field: { value, onChange }}) => (
              <Input 
                placeholder="Senha"
                secureTextEntry
                autoCapitalize="none"
                onChangeText={onChange}
                value={value}
                errorMessage={errors.password?.message}
                onSubmitEditing={handleSubmit(handleSignIn)}
                returnKeyType="send"
              />
            )}
          />

          <Button 
            title='Acessar'
            onPress={handleSubmit(handleSignIn)}
            isLoading={isLoading}
          />
          
        </Center>

        <Center mt={24}>
          <Text
            color={'gray.100'}
            fontSize={'sm'}
            mb={3}
          >
            Ainda não tem acesso?
          </Text>
          <Button
            title='Criar conta'
            variant={'outline'}
            onPress={handleNewAccount}
          />
        </Center>

      </VStack>
    </ScrollView>
  )
}