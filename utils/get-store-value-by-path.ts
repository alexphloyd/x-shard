import { type AnyStore, ExtractStoreProxyTarget } from '~/core/src/core';

export function get_store_value_by_path<
	S extends AnyStore,
	T extends ExtractStoreProxyTarget<S>,
	P extends ResourcePath<T>
>(store: S, path: P): DefineTypeByPath<T, P> {
	const arr = path.split('.');
	let target = store.get();

	for (let i = 0; i < arr.length; ++i) {
		target = target[arr[i]];
	}

	return target as DefineTypeByPath<T, P>;
}
