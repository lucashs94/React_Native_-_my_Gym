import { useEffect, useState } from "react"
import { FlatList, HStack, Heading, Text, VStack, useToast } from "native-base"
import { useIsFocused, useNavigation } from "@react-navigation/native"

import { api } from "@services/api"
import { AppError } from "@utils/AppError"
import { AppNavigatorRoutesProps } from "@routes/app.routes"

import Group from "@components/Group"
import HomeHeader from "@components/HomeHeader"
import ExerciseCard from "@components/ExerciseCard"

import { ExerciseDTO } from "@dtos/ExerciseDTO"
import Loading from "@components/Loading"


export default function Home(){

  const { navigate } = useNavigation<AppNavigatorRoutesProps>()
  const toast = useToast()

  const isFocused = useIsFocused()

  const [isLoading, setIsLoading] = useState(true)
  const [groups, setGroups] = useState<string[]>([])
  const [groupSelected, setGroupSelected] = useState('antebraço')
  const [exercises, setExercises] = useState<ExerciseDTO[]>([])


  function handleOpenExerciseDertails(exerciseId: string){
    navigate('exercise', { exerciseId })
  }


  async function fetchGroups() {
    try {
      const { data } = await api.get('groups')
      setGroups(data)
      
    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError ? error.message : 'Não foi possivel carregar os grupos.'

      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500',
      })
    }
  }


  async function fetchExercisesByGroup(){
    try {
      setIsLoading(true)

      const { data } = await api.get(`exercises/bygroup/${groupSelected}`)
      setExercises(data)
      
    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError ? error.message : 'Não foi possivel carregar os exercicios.'

      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500',
      })

    } finally{
      setIsLoading(false)
    }
  }


  useEffect(() => {

    fetchGroups()

  }, [])



  useEffect(() => {
    
    if(isFocused){
      fetchExercisesByGroup()
    }

  }, [groupSelected])


  return(
    <VStack
      flex={1}
    >
      <HomeHeader />

      <FlatList 
        data={groups}
        keyExtractor={ item => item }
        renderItem={ ({ item }) => (
          <Group
            name={item}
            isActive={groupSelected.toLocaleUpperCase() === item.toLocaleUpperCase()}
            onPress={ () => setGroupSelected(item) }
          />
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        _contentContainerStyle={{ px: 4, }}
        my={10}
        minH={10}
        maxH={10}
      />

      {
        isLoading ? <Loading /> :

          <VStack
            flex={1}
            px={4}
          >
            <HStack
              justifyContent={'space-between'}
              mb={5}
            >
              <Heading
                color={'gray.200'}
                fontSize={'md'}
                fontFamily={'heading'}
              >
                Exercicios
              </Heading>
              <Text
                color={'gray.200'}
                fontSize={'sm'}
              >
                {exercises.length}
              </Text>
            </HStack>
            
            <FlatList 
              data={exercises}
              keyExtractor={ item => item.id }
              renderItem={ ({ item }) => (
                <ExerciseCard 
                  data={item}
                  onPress={ () => handleOpenExerciseDertails(item.id) }
                />
              )}
              showsVerticalScrollIndicator={false}
              _contentContainerStyle={{ paddingBottom: 20, }}
            />

          </VStack>
      }
    </VStack>
  )
}