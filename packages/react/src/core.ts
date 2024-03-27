import { type AnyStore } from '~/core/src/core';
import { useEffect, useReducer } from 'react';
import { get_store_value_by_path } from 'utils/get-store-value-by-path';

export function useStore<S extends AnyStore, P extends ResourcePath<ReturnType<S['get']>>>(
	store: S,
	path: P
): Readonly<DefineTypeByPath<ReturnType<S['get']>, P & string>>;
export function useStore<S extends AnyStore>(store: S): ReturnType<S['get']>;
export function useStore<S extends AnyStore, P extends ResourcePath<ReturnType<S['get']>> | void = void>(
	store: S,
	path?: P
): ReturnType<S['get']> | Readonly<DefineTypeByPath<ReturnType<S['get']>, P & string>> {
	const [, force] = useReducer((x) => !x, true);

	useEffect(() => {
		const untrack = store.track(() => force());
		return untrack;
	}, [store]);

	if (typeof path === 'string' && path?.length) {
		return get_store_value_by_path(store, path);
	} else {
		return store.get();
	}
}
