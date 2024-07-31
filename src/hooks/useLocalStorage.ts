import { useEffect, useState } from "react";

const useLocalStorage = <Type>(identifier: string, initialValue: Type) => {
	const [storage, setStorage]	 = useState<Type>(() => {
		const curr = window.localStorage.getItem(identifier)
		return curr ? JSON.parse(curr) : initialValue
	})

	const store = (value: Type) => {
		setStorage(value)
		window.localStorage.setItem(identifier, JSON.stringify(value))
	}
	
	return { storage, store }
}

export default useLocalStorage
