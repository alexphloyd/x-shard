import { type Store } from '~/core/src/core';

export function get_store_value_by_path<S extends Store<any>, P extends ResourcePath<ReturnType<S['get']>>>(
	store: S,
	path: P
): DefineTypeByPath<ReturnType<S['get']>, P> {
	const arr = path.split('.');
	let target = store.get();

	for (let i = 0; i < arr.length; ++i) {
		target = target[arr[i]];
	}

	return target as DefineTypeByPath<ReturnType<S['get']>, P>;
}
