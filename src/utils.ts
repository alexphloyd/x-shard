export function parse_proxy_target<T>(value: T): T {
	if (!is_object(value)) {
		throw new Error(
			`Initial store value should be an object. 
			 You can store non-serializable values as $store property.`
		);
	}
	return value;
}

export function create_deep_immutable_proxy<T>(target: T): T {
	if (!is_object(target)) {
		return target;
	} else {
		return new Proxy(target as any, {
			get(target, prop) {
				return create_deep_immutable_proxy(target[prop as keyof typeof target]);
			},
			set() {
				throw new Error('Snapshot is immutable.');
			},
			deleteProperty() {
				throw new Error('Snapshot is immutable.');
			},
			setPrototypeOf() {
				throw new Error('Snapshot is immutable.');
			},
		});
	}
}

function is_object<T>(value: T) {
	return (
		value instanceof Object &&
		!(value instanceof Map) &&
		!(value instanceof Set) &&
		!(value instanceof Array)
	);
}
