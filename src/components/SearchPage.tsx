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
import { CiSearch } from "react-icons/ci";
import { IoIosSunny } from "react-icons/io";
import { FiMoon } from "react-icons/fi";
import { MdError } from "react-icons/md";
import { 
	getUsersRepositories,
	getOrgsRepositories,
	SearchableType,
	ListUserReposResponse,
	ListOrgReposResponse,
	SortableField,
	FilterableFieldsForOrgs,
	FilterableFieldsForUsers
} from "../utility/oktokitHelper";
import RepositoryList from "./RepositoryList";
import {onEnterKey} from "../utility/utilityEvents";
import {isFilterableFieldForOrgs, isFilterableFieldForUsers} from "../utility/typeGuards";

export type PaginationData = {page: number, quantity: number}
export type SortingData = {direction: 'asc' | 'desc', type: SortableField}

// defines the options for # of items to display
const quantityOptions = [10, 25, 50, 75, 100]

const paginationDefault = {page: 1, quantity: quantityOptions[1]}

/**
 * Handles the logic for the search nav. And displays the table. 
 **/
const SearchPage = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  const [searchQuery, setSearchQuery] = useState("Microsoft");
	const [serchResult, setSearchResult] = 
		useState<ListOrgReposResponse|ListUserReposResponse|undefined>()

	const [searchType, setSearchType] = useState<SearchableType>('user')
	const filterBy = useRef<FilterableFieldsForOrgs|FilterableFieldsForUsers>('all')
	const [fetching, setFetching] = useState<boolean>(false)

	const currentSearch = useRef<AbortController|undefined>(undefined)
	const paginationData = useRef<PaginationData>({...paginationDefault})

	const sortingData = useRef<SortingData>({direction: 'desc', type: 'created'})
	const searchRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		//focus search bar on load
		searchRef.current?.focus()

		//abort any request on unmount
		return () => currentSearch.current?.abort()
	},[])

	// are we searching for a user or an org
	const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const type = event.target.value as SearchableType
		setSearchType(type)
	}

	//manage the search inputs value
	const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const query = event.target.value
		setSearchQuery(query)
	}

	//update the users filter by preference
	const handleFilterByChange = (
		filter: FilterableFieldsForOrgs|FilterableFieldsForUsers
	) => {
		filterBy.current = filter

		search()
	}

	//update the users pagination preferences and search
	const handlePaginationChange = (
		propety: keyof PaginationData, 
		value: number
	) => {
		paginationData.current = {...paginationData.current, [propety]: value}

		search()
	}

	//update the users sorting preference and search
	const handleSortingChange = (property: keyof SortingData, value: string) => {
		const newData: SortingData = {...sortingData.current, [property]: value}
		sortingData.current = newData

		search()
	}

	//ensures that pagination is reset before performing search
	const newSearch = () => {
		paginationData.current = {...paginationDefault}
		search()
	}

	//begin searching for the specified user / org
	const search = async () => {
		// don't allow request when rate limited 
		if (serchResult?.rateLimited || searchQuery == '') return 

		setFetching(true)
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
				sortDirection,
				isFilterableFieldForUsers(filterBy.current) ? filterBy.current : undefined
			) : 
			await getOrgsRepositories(
				searchQuery, 
				abortController.signal, 
				page, 
				quantity,
				sortType,
				sortDirection,
				isFilterableFieldForOrgs(filterBy.current) ? filterBy.current : undefined
			)

		setSearchResult(response)
		setFetching(false)
		currentSearch.current = undefined
	}


	//modify the toggle icon based on current theme
  let themeToggleIcon = <IoIosSunny size={30} />;
  if (colorMode === "light") {
    themeToggleIcon = <FiMoon size={30} />;
  }

	//Something went wrong when searching
	const errorMessageJsx = !!serchResult?.errorMessage && <VStack 
		h={'100%'}
		justifyContent={'center'} 
		alignItems={'center'} 
		direction={'column'} 
		gap={4}
	>
		<MdError size={'70px'}/>
		<p>{serchResult.errorMessage}</p>
	</VStack>

	//Renders the repositories
	const tableJsx = !!serchResult?.data && <RepositoryList 
		repositories={serchResult.data} 
		lastPage={serchResult?.lastPage!}
		quantityOptions={quantityOptions}
		paginationData={paginationData.current} 
		setPaginationData={handlePaginationChange}
		searchType={searchType}
		sortingData={sortingData.current}
		setSortData={handleSortingChange}
		filterBy={filterBy.current}
		loading={fetching}
		setFilterBy={handleFilterByChange}
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
							ref={searchRef}
							type="text"
							placeholder={'Search...'}
							value={searchQuery}
							onChange={handleQueryChange}
							onKeyDown={(event) => onEnterKey(event, newSearch)}
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
            backgroundColor: colorMode === 'dark' ?  "gray.600" : "gray.300",
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
