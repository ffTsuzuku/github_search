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

const getUsersRepositories = (
    username: string,
    signal: AbortSignal,
	page: number, 
	quantity: number,
	sortType: SortableField,
	sortDirection: 'asc' | 'desc'
): Promise<ListUserReposResponse> => {
    return getRepositoriesForUserOrOrg(
		username, 'user', 
		signal, 
		page, 
		quantity,
		sortType,
		sortDirection
	) 
}
const getOrgsRepositories = (
    org: string,
    signal: AbortSignal,
	page: number, 
	quantity: number,
	sortType: SortableField,
	sortDirection: 'asc' | 'desc'
): Promise<ListOrgReposResponse> => {
    return getRepositoriesForUserOrOrg(
		org, 'org',
		signal,
		page,
		quantity,
		sortType,
		sortDirection
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
	sortDirection: 'asc' | 'desc'
): Promise<
	ListUserReposResponse|
	ListOrgReposResponse|
	BaseRepositoriesListResponse<undefined>
> => {
    try {
        const response = type === 'user' ? 
			await  octokit.rest.repos.listForUser({
				username,
				per_page: quantity,
				page: page,
				sort: sortType,
				direction: sortDirection,
				request: { signal },
			}) : 
			await octokit.rest.repos.listForOrg({
				org: username,
				per_page: quantity,
				page: page,
				sort: sortType,
				direction: sortDirection,
				request: { signal },
			})

		const paginationLinks = response.headers?.link ?? ''
		const [_, lastPageUrl] = paginationLinks?.split(',')
		const lastPage = Number(lastPageUrl?.match(/&page=(\d+)>/)?.[1]) || 1

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
