import { useEffect, useLayoutEffect, useState } from "react"
import { TouchableOpacity } from "react-native"
import { Box, HStack, Heading, Icon, Image, ScrollView, Text, VStack, useToast } from "native-base"
import { useIsFocused, useNavigation, useRoute } from "@react-navigation/native"
import { Feather } from '@expo/vector-icons'

import { api } from "@services/api"
import { AppError } from "@utils/AppError"
import { AppNavigatorRoutesProps } from "@routes/app.routes"

import BodySvg from '@assets/body.svg'
import SeriesSvg from '@assets/series.svg'
import RepsSvg from '@assets/repetitions.svg'

import Button from "@components/Button"
import Loading from "@components/Loading"

import { ExerciseDTO } from "@dtos/ExerciseDTO"


type RouteParams = {
  exerciseId: string
}

export default function Exercise(){

  const [sending, setSending] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [exercise, setExercise] = useState<ExerciseDTO>({} as ExerciseDTO)

  const routes = useRoute()
  const { exerciseId } = routes.params as RouteParams

  const isFocused = useIsFocused()

  const toast = useToast()
  
  const { navigate } = useNavigation<AppNavigatorRoutesProps>()


  function handleGoBack(){
    navigate('home')
  }

  
  async function fetchExerciseDetails(){
    try {
      setIsLoading(true)

      const { data } = await api.get(`exercises/${exerciseId}`)
      setExercise(data)
      
    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError ? error.message : 'Não foi possivel carregar os detalhes do exercício.'

      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500',
      })

    } finally{
      setIsLoading(false)
    }
  }

  
  async function handleExerciseHistoryRegister(){
    try {
      setSending(true)
      await api.post('history', { exercise_id: exerciseId })

      toast.show({
        title: 'Parabéns! Exercício registrado no seu histórico.',
        placement: 'top',
        bgColor: 'green.700',
      })

      navigate('history')
      
    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError ? error.message : 'Não foi possivel registrar o exercício.'

      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500',
      })

    } finally{
      setSending(false)
    }
  }


  useEffect(() => {

    fetchExerciseDetails()

  }, [isFocused])


  return(
    <VStack
      flex={1}
    >
      <VStack
        px={8}
        bg={'gray.600'}
        pt={12}
      >
        <TouchableOpacity
          onPress={handleGoBack}
        >
          <Icon 
            as={Feather}
            name="arrow-left"
            color={'green.500'}
            size={6}
          />
        </TouchableOpacity>

        <HStack
          justifyContent={'space-between'}
          mt={4}
          mb={8}
          alignItems={'center'}
        >
          <Heading
            color={'gray.100'}
            fontSize={'lg'}
            fontFamily={'heading'}
            flexShrink={1}
          >
            {exercise.name}
          </Heading>

          <HStack
            alignItems={'center'}
          >
            <BodySvg />
            <Text
              color={'gray.200'}
              ml={1}
              textTransform={'capitalize'}
            >
              {exercise.group}
            </Text>
          </HStack>
        </HStack>
      </VStack>

      { isLoading ? <Loading /> : 
        <ScrollView>
          <VStack
            p={8}
          >
            <Box
              rounded={'lg'}
              mb={3}
              overflow={'hidden'}
            >
              <Image
                alt="foto do exercicio"
                source={{ uri: `${api.defaults.baseURL}/exercise/demo/${exercise.demo}` }}
                w={'full'}
                h={80}
                resizeMode="cover"
                rounded={'lg'}
              />
            </Box>
            <Box
              bg={'gray.600'}
              rounded={'md'}
              pb={4}
              px={4}
            >
              <HStack
                alignItems={'center'}
                justifyContent={'space-around'}
                mb={6}
                mt={5}
              >
                <HStack>
                  <SeriesSvg />
                  <Text
                    color={'gray.200'}
                    ml={2}
                  >
                    {exercise.series} séries
                  </Text>
                </HStack>
                <HStack>
                  <RepsSvg />
                  <Text
                    color={'gray.200'}
                    ml={2}
                  >
                    {exercise.repetitions} Reps
                  </Text>
                </HStack>
              </HStack>

              <Button
                title="Marcar como realizado"
                onPress={handleExerciseHistoryRegister}
                isLoading={sending}
              />
            </Box>
          </VStack>
        </ScrollView>
      }
    </VStack>
  )
}