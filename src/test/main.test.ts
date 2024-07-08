import { expect, test } from 'vitest'
import {getUsersRepositories} from '../utility/oktokitHelper'

test('Expected to find user repositories', () => {
	const fetchData = async () => {
		const controller = new AbortController()
		const resp = await getUsersRepositories(
			'ffTsuzuku', 
			controller.signal, 
			1, 25
		)
		const {data} = resp
		expect(data).not.toBe(undefined)
	}
	fetchData()
})

test('')
