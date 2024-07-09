import {
    FilterableFieldsForOrgs,
    FilterableFieldsForUsers,
} from './octokitHelper'

const isFilterableFieldForOrgs = (
    filter: any
): filter is FilterableFieldsForOrgs => {
    return ['all', 'public', 'private', 'forks', 'sources', 'member'].includes(
        filter
    )
}

const isFilterableFieldForUsers = (
    filter: any
): filter is FilterableFieldsForUsers => {
    return ['all', 'owner', 'member'].includes(filter)
}

export { isFilterableFieldForOrgs, isFilterableFieldForUsers }
