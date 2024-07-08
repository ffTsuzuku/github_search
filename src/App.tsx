import { ChakraProvider, Box } from "@chakra-ui/react";
import theme from "./theme.ts";
import SearchPage from "./components/SearchPage.tsx";

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Box w={"100vw"} h={"100vh"} overflow={'hidden'}>
        <SearchPage />
      </Box>
    </ChakraProvider>
  );
}

export default App;
