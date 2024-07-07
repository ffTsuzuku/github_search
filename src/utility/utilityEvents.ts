// do something via enter key
const onEnterKey = (event: React.KeyboardEvent, callback: () => void) => {
	const isEnterKey = event.key === 'Enter'
	if (isEnterKey) {
		callback()
	}
}


export {
	onEnterKey
}
