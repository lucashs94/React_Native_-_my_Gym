import { useEffect, useState } from "react"
import { Center, Heading, Text, VStack, SectionList, useToast } from "native-base"
import { useIsFocused } from "@react-navigation/native"

import { AppError } from "@utils/AppError"
import { api } from "@services/api"
import { HistoryByDayDTO } from "@dtos/HistoryByDayDTO"

import ScreenHeader from "@components/ScreenHeader"
import HistoryCard from "@components/HistoryCard"
import Loading from "@components/Loading"


export default function History(){

  const [isLoading, setIsLoading] = useState(true)
  const [exercises, setExercises] = useState<HistoryByDayDTO[]>([])


  const isFocused = useIsFocused()
  const toast = useToast()


  async function fetchHistory(){
    try {
      setIsLoading(true)

      const { data } = await api.get('history')
      setExercises(data)
      
      
    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError ? error.message : 'Não foi possivel carregaer o histórico.'

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
    fetchHistory()
  }, [isFocused])


  return(
    <VStack
      flex={1}
    >
      
      <ScreenHeader 
        title='Histórico de Exercicios'
      />

      {
        isLoading ? <Loading /> : 
        <SectionList 
          sections={exercises}
          keyExtractor={ item => item.id }
          renderItem={ ({ item }) => (
            <HistoryCard 
              data={item}
            />
          )}
          renderSectionHeader={({ section}) => (
            <Heading
              color={'gray.200'}
              fontSize={'md'}
              fontFamily={'heading'}
              mt={6}
              mb={3}
            >
              {section.title}
            </Heading>
          )}
          contentContainerStyle={
            exercises.length === 0 && { flex: 1, justifyContent: 'center' }
          }
          ListEmptyComponent={ () => (
            <Text
              color={'gray.200'}
              textAlign={'center'}
              fontSize={'md'}
              px={12}
            >
              Não há exercícios registrados ainda
              Vamos treinar hoje?
            </Text>
          )}
          px={4}
          showsVerticalScrollIndicator={false}
        />
      }

    </VStack>
  )
}