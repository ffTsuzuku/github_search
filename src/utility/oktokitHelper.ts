import { Octokit, RequestError } from 'octokit'
import { Endpoints  } from '@octokit/types'

export type SearchableType = 'user' | 'org'

const octokit = new Octokit({ auth: import.meta.env.VITE_API_TOKEN })

export type ListUserRepos = Endpoints['GET /users/{username}/repos']['response']
export type ListOrgRepos = Endpoints['GET /orgs/{org}/repos']['response']

type BaseRepositoriesListResponse<T> = {
	data?: T,
	errorMessage?: string,
	rateLimited?: boolean,
	lastPage?: number
}

export type ListUserReposResponse = BaseRepositoriesListResponse<ListUserRepos[]> 
export type ListOrgReposResponse = BaseRepositoriesListResponse<ListOrgRepos[]> 
export type SortableField = 'created' | 'updated' | 'pushed' | 'full_name'
export type FilterableFieldsForOrgs = 'all'| 'public'| 'private' | 'forks'| 'sources'| 'member'
export type FilterableFieldsForUsers = 'all' | 'owner' | 'member'

const getUsersRepositories = (
    username: string,
    signal: AbortSignal,
	page: number, 
	quantity: number,
	sortType: SortableField,
	sortDirection: 'asc' | 'desc',
	filterBy?: FilterableFieldsForUsers
): Promise<ListUserReposResponse> => {
    return getRepositoriesForUserOrOrg(
		username, 'user', 
		signal, 
		page, 
		quantity,
		sortType,
		sortDirection,
		filterBy
	) 
}
const getOrgsRepositories = (
    org: string,
    signal: AbortSignal,
	page: number, 
	quantity: number,
	sortType: SortableField,
	sortDirection: 'asc' | 'desc',
	filterBy?: FilterableFieldsForOrgs
): Promise<ListOrgReposResponse> => {
    return getRepositoriesForUserOrOrg(
		org, 'org',
		signal,
		page,
		quantity,
		sortType,
		sortDirection,
		filterBy
	)
}

/**
 * Performs a search for a user or organization.
 *
 * @param username: username for the user or org.
 * @param type: want to search for an org or user?
 * @param signal: ties the request to an abort signal
 */
const getRepositoriesForUserOrOrg  = async (
    username: string,
    type: SearchableType,
    signal: AbortSignal,
	page: number, 
	quantity: number,
	sortType: SortableField,
	sortDirection: 'asc' | 'desc',
	filterBy: FilterableFieldsForOrgs | FilterableFieldsForUsers
): Promise<
	ListUserReposResponse|
	ListOrgReposResponse|
	BaseRepositoriesListResponse<undefined>
> => {
    try {
		console.log('filter by', filterBy)
        const response = type === 'user' ? 
			await  octokit.rest.repos.listForUser({
				username,
				per_page: quantity,
				page: page,
				sort: sortType,
				direction: sortDirection,
				type: filterBy,
				request: { signal },
			}) : 
			await octokit.rest.repos.listForOrg({
				org: username,
				per_page: quantity,
				page: page,
				sort: sortType,
				type: filterBy,
				direction: sortDirection,
				request: { signal },
			})

		const paginationLinks = response.headers?.link ?? ''
		const links = paginationLinks?.split(',')
		const lastPageUrl = links.filter((link) => link.includes('last'))[0]
		let lastPage = page
		if (lastPageUrl) {
			const possibleMatches = lastPageUrl.match(/\d+/g)!
			lastPage = parseInt(possibleMatches[2], 10)
		}

		console.log({lastPage, lastPageUrl, paginationLinks})
		//@ts-ignore
        return { data: response.data, lastPage }
    } catch (e) {
        const result: BaseRepositoriesListResponse<undefined> = {
            data: undefined,
            errorMessage: undefined,
            rateLimited: false,
        }
        if (e instanceof RequestError) {
            if (e.status === 404) {
                result.errorMessage = 'No Results Found.'
            } else if (e.response?.headers['retry-after']) {
                const waitTime = e.response.headers['retry-after']
                result.errorMessage = `Please try again in ${waitTime} seconds`
                result.rateLimited = true
            } else if (
                e.status === 403 &&
                e.response?.headers['x-ratelimit-remaining'] === '0'
            ) {
                const waitTime = e.response.headers['x-ratelimit-reset']
                result.errorMessage = `Please try again in ${waitTime} seconds`
                result.rateLimited = true
            } else if (e.status === 403) {
                result.errorMessage = 'Please try again in one minute'
                result.rateLimited = true
            }
        } else {
            result.errorMessage = 'Unexpected Error, please try again'
        }

        return result
    }
}

export { getOrgsRepositories, getUsersRepositories }
