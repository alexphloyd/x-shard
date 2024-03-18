export function is_object(value: unknown): value is object {
	return value != null && value.constructor.name === 'Object';
}

export function unsafe_parse_object<T>(value: T): T {
	if (!is_object(value)) {
		throw new Error(
			`Initial store value should be an object. 
			 You can store non-serializable values as $store property.`
		);
	}
	return value;
}
