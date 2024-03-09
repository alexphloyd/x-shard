export function parse_proxy_target(value: unknown) {
	if (!is_object(value)) {
		throw new Error(
			`Initial store value should be an object. 
			 You can store non-serializable values as $store property.`
		);
	}
	return value;
}

function is_object(value: unknown) {
	return (
		value instanceof Object &&
		!(value instanceof Map) &&
		!(value instanceof Set) &&
		!(value instanceof Array)
	);
}
