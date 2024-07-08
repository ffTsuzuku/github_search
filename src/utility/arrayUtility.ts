//check if the element in the array are in ascending order
function isArrayInAscendingOrder<T>(
	arr: T[], 
	accessorFn?: (element: T) => any,
	compareFn?: (prev: any, curr: any) => boolean
): boolean {
	for (let i = 1; i < arr.length; i++) {
		const curr = accessorFn ? accessorFn(arr[i]) : arr[i]
		const prev = accessorFn ? accessorFn(arr[i -1]) : arr[i-1]

		if (compareFn) {
			if (!compareFn(prev, curr)) {
				return false
			}
		} else {
			if (prev > curr) {
				return false
			}
		}
  }
  return true;
}

export { isArrayInAscendingOrder }
