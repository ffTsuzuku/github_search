import { expect, test, describe } from 'vitest'
import {
    getOrgsRepositories,
    getUsersRepositories,
    UserRepository,
} from '../utility/octokitHelper'
import { isArrayInAscendingOrder } from '../utility/arrayUtility'

const userLogin = 'ffTsuzuku'
const orgLogin = 'Microsoft'

describe('Fetching Repositories', () => {
    test('Expected to find user repositories', async () => {
        const controller = new AbortController()
        const resp = await getUsersRepositories(
            userLogin,
            controller.signal,
            1,
            25
        )
        const { data } = resp
        expect(data?.length).toBeGreaterThan(0)
    })

    test('Searching for user as organization', async () => {
        const controller = new AbortController()
        const resp = await getOrgsRepositories(
            userLogin,
            controller.signal,
            1,
            25
        )
        const { data } = resp
        expect(data).toBe(undefined)
    })
})

describe('Sorting Repositories', () => {
    test('Sort By Full Name Asc', async () => {
        const controller = new AbortController()
        const resp = await getUsersRepositories(
            userLogin,
            controller.signal,
            1,
            25,
            'full_name',
            'asc'
        )
        const { data } = resp
        if (!data) {
            return false
        }

        const inOrder = isArrayInAscendingOrder(data, (rep: UserRepository) =>
            rep.full_name.toLowerCase()
        )
        expect(inOrder).toBeTruthy()
    })

    test('Sort By Created Asc', async () => {
        const controller = new AbortController()
        const resp = await getUsersRepositories(
            userLogin,
            controller.signal,
            1,
            25,
            'created',
            'asc'
        )
        const { data } = resp
        if (!data) {
            return false
        }

        const inorder = isArrayInAscendingOrder(
            data,
            (rep: UserRepository) => rep.created_at,
            (prevTime: string, currTime: string) => {
                return (
                    new Date(currTime).getTime() >= new Date(prevTime).getTime()
                )
            }
        )
        expect(inorder).toBeTruthy()
    })

    test('Sort By Updated At', async () => {
        const controller = new AbortController()
        const resp = await getUsersRepositories(
            userLogin,
            controller.signal,
            1,
            25,
            'updated',
            'asc'
        )

        const { data } = resp
        if (!data) {
            return false
        }
        const inOrder = isArrayInAscendingOrder(
            data,
            (repo: UserRepository) => repo.updated_at,
            (prevTime: string, currTime: string) => {
                return (
                    new Date(currTime).getTime() >= new Date(prevTime).getTime()
                )
            }
        )
        expect(inOrder).toBeTruthy()
    })

    test('Sort By Last Commit', async () => {
        const controller = new AbortController()
        const resp = await getUsersRepositories(
            userLogin,
            controller.signal,
            1,
            25,
            'pushed',
            'asc'
        )

        const { data } = resp
        if (!data) {
            return false
        }
        const inOrder = isArrayInAscendingOrder(
            data,
            (repo: UserRepository) => repo.pushed_at,
            (prevTime: string, currTime: string) => {
                return (
                    new Date(currTime).getTime() >= new Date(prevTime).getTime()
                )
            }
        )
        expect(inOrder).toBeTruthy()
    })
})

describe('Filtering Repositories', () => {
    //filtering test

    //NOTE: this test is uneliable as repositories can change overtime
    test('Get Member Only Repos', async () => {
        const controller = new AbortController()
        const response = await getUsersRepositories(
            userLogin,
            controller.signal,
            1,
            25,
            undefined,
            undefined,
            'member'
        )
        const { data: repos = [] } = response
        let memberOnly = true
        for (const repo of repos) {
            if (repo.owner.login === userLogin) {
                memberOnly = false
                break
            }
        }

        expect(memberOnly).toBeTruthy()
    })

    test('Get Repos That were forked by an Org', async () => {
        const controller = new AbortController()
        const response = await getOrgsRepositories(
            orgLogin,
            controller.signal,
            1,
            25,
            undefined,
            undefined,
            'forks'
        )
        const { data: repos = [] } = response
        let forkOnly = true
        for (const repo of repos) {
            if (!repo.fork) {
                forkOnly = false
                break
            }
        }

        expect(forkOnly).toBeTruthy()
    })
})
