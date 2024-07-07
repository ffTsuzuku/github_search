import { useState, useRef, useEffect } from "react";
import {
  Flex,
  HStack,
	VStack,
  Input,
  InputGroup,
  InputRightElement,
  Select,
  useColorMode,
} from "@chakra-ui/react";
import { CiSun, CiSearch } from "react-icons/ci";
import { FiMoon } from "react-icons/fi";
import { MdError } from "react-icons/md";
import { 
	getUsersRepositories,
	getOrgsRepositories,
	SearchableType,
	ListUserReposResponse,
	ListOrgReposResponse,
	SortableField
} from "../utility/oktokitHelper";
import RepositoryList from "./RepositoryList";

export type PaginationData = {page: number, quantity: number}
export type SortingData = {direction: 'asc' | 'desc', type: SortableField}

const quantityOptions = [10, 25, 50, 75, 100]
const paginationDefault = {page: 1, quantity: quantityOptions[1]}
const SearchPage = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  const [searchQuery, setSearchQuery] = useState("ffTsuzuku");
	const [serchResult, setSearchResult] = 
		useState<ListOrgReposResponse|ListUserReposResponse|undefined>()

	const [searchType, setSearchType] = useState<SearchableType>('user')

	const currentSearch = useRef<AbortController|undefined>(undefined)
	const paginationData = useRef<PaginationData>({...paginationDefault})

	const sortingData = useRef<SortingData>({direction: 'desc', type: 'created'})

	//abort any request on unmount
	useEffect(() => {
		return () => currentSearch.current?.abort()
	},[])

	const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const type = event.target.value as SearchableType
		setSearchType(type)
	}

	const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const query = event.target.value
		setSearchQuery(query)
	}

	const handlePaginationChange = (
		propety: keyof PaginationData, 
		value: number
	) => {
		paginationData.current = {...paginationData.current, [propety]: value}

		search()
	}

	const handleSortingChange = (property: keyof SortingData, value: string) => {
		const newData: SortingData = {...sortingData.current, [property]: value}
		sortingData.current = newData

		search()
	}

	const newSearch = () => {
		paginationData.current = {...paginationDefault}
		search()
	}

	const search = async () => {
		// don't allow request when rate limited 
		if (serchResult?.rateLimited || searchQuery == '') return 

		if (currentSearch.current) {
				currentSearch.current.abort('Cancelling old request')
		}

		const abortController = new AbortController()
		currentSearch.current = abortController

		const { page, quantity } = paginationData.current
		const {type: sortType, direction: sortDirection } = sortingData.current
		const response = searchType === 'user' ?  
			await getUsersRepositories(
				searchQuery, 
				abortController.signal, 
				page, 
				quantity,
				sortType,
				sortDirection
			) : 
			await getOrgsRepositories(
				searchQuery, 
				abortController.signal, 
				page, 
				quantity,
				sortType,
				sortDirection
			)

		setSearchResult(response)
		currentSearch.current = undefined
	}


  let themeToggleIcon = <CiSun size={30} />;
  if (colorMode === "light") {
    themeToggleIcon = <FiMoon size={30} />;
  }

	const errorMessageJsx = !!serchResult?.errorMessage && <VStack 
		justifyContent={'center'} 
		alignItems={'center'} 
		direction={'column'} 
		gap={4}
	>
		<MdError size={'70px'}/>
		<p>{serchResult.errorMessage}</p>
	</VStack>

	const tableJsx = !!serchResult?.data && <RepositoryList 
		repositories={serchResult.data} 
		lastPage={serchResult?.lastPage!}
		quantityOptions={quantityOptions}
		paginationData={paginationData.current} 
		setPaginationData={handlePaginationChange}
		sortingData={sortingData.current}
		setSortData={handleSortingChange}
	/>


  return (
    <>
      <Flex
        id="header"
        justifyContent="space-between"
        alignItems="center"
        px={3}
				overflow={'hidden'}
        shadow="md"
        w={"100%"}
        h="80px"
      >
				<HStack w={'80%'}>
					<InputGroup w={'60%'}>
						<Input
							type="text"
							placeholder={'Search...'}
							value={searchQuery}
							onChange={handleQueryChange}
						/>
						<InputRightElement cursor="pointer" onClick={newSearch}>
							<CiSearch />
						</InputRightElement>
					</InputGroup>
					<Select value={searchType} w={'40%'} onChange={handleTypeChange}>
						<option value="user">User</option>
						<option value="org">Organization</option>
					</Select>
				</HStack>

        <Flex
          p={2}
          justifyContent="center"
          alignItems="center"
          borderRadius={3}
          _hover={{
            backgroundColor: "gray.200",
          }}
          onClick={toggleColorMode}
          color="gray.400"
          cursor="pointer"
        >
          {themeToggleIcon}
        </Flex>
      </Flex>
			{tableJsx}
			{errorMessageJsx}
    </>
  );
};

export default SearchPage;
