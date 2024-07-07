import {useMemo} from "react"
import { ListUserRepos, ListOrgRepos } from "../utility/oktokitHelper"
import { AgGridReact } from "ag-grid-react"
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { border, Box, Flex, FormControl, FormLabel, HStack, Select } from "@chakra-ui/react";
import { useColorModeValue } from "@chakra-ui/react";
import {PaginationData, SortingData} from "./SearchPage";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import { SortableField } from "../utility/oktokitHelper";
const columns = [
	{field: 'full_name', flex: 1, minWidth: 150},
	{field: 'description', flex: 2, minWidth: 150},
	{field: 'created_at', flex: 1, minWidth: 150},
	{field: 'updated_at', flex: 1, minWidth: 150},
	{field: 'pushed_at', flex: 1, minWidth: 150},
]	

const sortOptions: {label: string, value: SortableField}[] = [
	{label: 'Created At', value: 'created'}, 
	{label: 'Updated At', value: 'updated'}, 
	{label: 'Last Commit', value: 'pushed'},
	{label: 'Full Name', value: 'full_name'}
]

interface RepositoryListProps {
	repositories: ListUserRepos | ListOrgRepos
	paginationData: PaginationData
	lastPage: number
	quantityOptions: number[]
	sortingData: SortingData
	setSortData: (propety: keyof SortingData, value: string) => void
	setPaginationData: (propety: keyof PaginationData, value: number) => void
}

const RepositoryList = ({ 
	repositories, 
	paginationData,
	lastPage,
	sortingData,
	setSortData,
	setPaginationData,
	quantityOptions,
}: RepositoryListProps) => {

	//TODO: Fix the date format
	//TODO: add more height to rable rows
	//TODO: add creator name & profile icon
	//TODO: Filtering & sorting via api
	//TODO: Memoize props to not triggered when search type changed
	//TODO: test without api key
	const theme = useColorModeValue('ag-theme-quartz', 'ag-theme-quartz-dark')
	const bgColor = useColorModeValue('#e2e8f0','#1f2936')
	const {page, quantity} = paginationData

	const handlePaginationChange = (
		value: number,
		property: keyof PaginationData
	) => {
		setPaginationData(property, value)
	}

	const sortingDataChange = (
		event: React.ChangeEvent<HTMLSelectElement>, 
		type: keyof SortingData
	) => {
		setSortData(type, event.target.value)
	}

	return <div style={{ height: '80%', padding: '50px'}}>		
		<HStack>
			<FormControl>
				<FormLabel>{'Sort By'}</FormLabel>
				<Select value={sortingData.type} onChange={(event) => sortingDataChange(event, 'type')}>
					{sortOptions.map(option => <option key={option.value}>
						{option.label}
					</option>)}
				</Select>
			</FormControl>
			<FormControl>
				<FormLabel>{'Direction'}</FormLabel>
				<Select 
					value={sortingData.direction} 
					onChange={(event) => sortingDataChange(event, 'direction')}
				>
					<option value="asc">Ascending</option>
					<option value="desc">Descending</option>
				</Select>
			</FormControl>
		</HStack>
		<AgGridReact 
			suppressPaginationPanel={true}
			rowData={repositories} 
			columnDefs={columns} 
			className={theme}
			styles={{borderRadius: '0px'}}
		/>
		<HStack 
			justifyContent={{base: 'space-between', sm: 'flex-end'}} 
			backgroundColor={bgColor} 
			h={'50px'} 
			borderWidth={1}
			borderStyle={'solid'}
			padding={5} 
			gap={2} 
			borderRadius={'0px 0px 8px 8px'}
		>
			<HStack alignItems={'center'} w={['60%', '35%', '25%', '25%']} justifyContent={'flex-end'}>
				<p>{'Page Size:'}</p>
				<Select value={quantity} width={'100px'} borderRadius={10} onChange={
					(event) => handlePaginationChange(Number(event.target.value), 'quantity')
				}>
					{quantityOptions.map((option) => <option 
						key={option} 
						value={option}>{option}</option>
					)}
				</Select>
			</HStack>
			<HStack w={['40%', '25%', '20%', '15%', '8%']} justifyContent={'flex-end'}>
				<MdArrowBackIos 
					onClick={() => handlePaginationChange(page - 1, 'page')} 
					cursor={'pointer'}
				/>
				<p>{`Page ${page} of ${lastPage}`}</p>
				<MdArrowForwardIos onClick={() => handlePaginationChange(page + 1, 'page')} 
					cursor={'pointer'}
				/>
			</HStack>
		</HStack>
  </div>
}

export default RepositoryList
