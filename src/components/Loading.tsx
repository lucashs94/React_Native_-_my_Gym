import { Center, Spinner } from "native-base";


export default function Loading(){
  return(
    <Center flex={1} bg='gray.700'>

      <Spinner
        color='green.500'
      />

    </Center>
  )
}