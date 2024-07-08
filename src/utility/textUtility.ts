//make the first letter of a string uppercase
function capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1)
}

export {
	capitalizeFirstLetter
}
