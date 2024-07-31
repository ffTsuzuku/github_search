import { Flex, HStack, Text } from "@chakra-ui/react";
import { removeFromHistory, SearchQuery } from "../utility/history";
import { SlClose } from "react-icons/sl";

type Props = {
  searchHistory: SearchQuery[];
  currentSearch: string;
  setHistory: (history: SearchQuery[]) => void;
};
const History = ({ searchHistory, currentSearch, setHistory }: Props) => {
  const handleRemoveFromHistory = (query: SearchQuery) => {
    const newHistory = removeFromHistory(searchHistory, query);
    setHistory(newHistory);
  };
  return searchHistory.map((search) => (
    <HStack
      p={3}
      gap={3}
      role={"listitem"}
      key={search.name + search.type}
      backgroundColor={currentSearch === search.name ? "green.500" : "gray.500"}
    >
      <Text>{search.name}</Text>
      <SlClose
        onClick={() =>
          handleRemoveFromHistory({ name: search.name, type: search.type })
        }
      />
    </HStack>
  ));
};

export default History;
