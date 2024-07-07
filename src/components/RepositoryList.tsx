import { ListUserRepos, ListOrgRepos } from "../utility/oktokitHelper"
import { AgGridReact } from "ag-grid-react"
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { FormControl, FormLabel, HStack, Image, Link, Select } from "@chakra-ui/react";
import { useColorModeValue } from "@chakra-ui/react";
import {PaginationData, SortingData} from "./SearchPage";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import { SortableField } from "../utility/oktokitHelper";

const formatDate = (date: string) => {
	const userLocale = navigator.language
	const datObj = new Date(date)
	return datObj.toLocaleDateString(userLocale, {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	})
}
const columns = [
	{
		cellRenderer: (row: any) => <OwnerAvatar 
			avatarUrl={row.data.owner.avatar_url} 
			name={row.data.owner.login} 
			profileUrl={row.data.owner.html_url}
		/>,
		flex: 1, 
		minWidth: 150,
		headerName: 'Owner'
	},
	{
		cellRenderer: (row: any) => <Link 
			href={row.data.html_url} 
			color={'blue.300'} isExternal
		>
			{row.data.full_name}
		</Link>,
		flex: 1, 
		minWidth: 150,
		headerName: 'Full Name'
	},
	{field: 'description', flex: 2, minWidth: 150, headerName: 'Description'},
	{
		field: 'created_at', 
		flex: 1, 
		minWidth: 150, 
		headerName: 'Created',
		valueFormatter: (row: any) => formatDate(row.value) 
	},
	{
		field: 'updated_at',
		flex: 1,
		minWidth: 150,
		headerName: 'Last Update',
		valueFormatter: (row: any) => formatDate(row.value) 
	},
	{
		field: 'pushed_at', 
		flex: 1, 
		minWidth: 150,
		headerName: 'Last Commit',
		valueFormatter: (row: any) => formatDate(row.value) 
	},
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

	//TODO: add more height to rable rows
	//TODO: add creator name & profile icon
	//TODO: Memoize props to not triggered when search type changed
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

	const onFirstPage = page === 1
	const onLastPage = page === lastPage
	const backArrowProps = { color: onFirstPage ? '#514f4f' : undefined, onClick: onFirstPage ? undefined : () => handlePaginationChange(page - 1, 'page'), cursor: onFirstPage ? undefined : 'pointer' } 
	const forwardArrowProps = { color: onLastPage ? '#514f4f' : undefined,
		onClick: onLastPage ? undefined : () => handlePaginationChange(page + 1, 'page'),
		cursor: onLastPage ? undefined : 'pointer'
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
			<HStack 
				alignItems={'center'} 
				w={{base: '55%', sm: '60%', md: '75%', lg: '87%', xl: '83%', '2xl': '82%'}} 
				justifyContent={'flex-end'}
			>
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
			<HStack 
				w={{base: '45%', sm: '40%', md: '25%', lg: '17%', xl: '13%', '2xl': '12%'}} 
				justifyContent={'flex-end'}
			>
				<MdArrowBackIos {...backArrowProps}/>
				<p>{`Page ${page} of ${lastPage}`}</p>
				<MdArrowForwardIos {...forwardArrowProps} />
			</HStack>
		</HStack>
  </div>
}

function OwnerAvatar ({avatarUrl, profileUrl, name}: {avatarUrl: string, profileUrl: string, name: string}) {
	return <HStack alignItems={'center'}>
		<Image src={avatarUrl} alt={name} w={7} borderRadius={'30px'}/>
		<Link href={profileUrl} isExternal color={'blue.300'}>
			{name}
		</Link>
	</HStack>
}

export default RepositoryList
