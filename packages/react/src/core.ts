import { ProxyTarget, type AnyStore, ExtractStoreProxyTarget } from '~/core/src/core';
import { useEffect, useReducer } from 'react';
import { get_store_value_by_path } from 'utils/get-store-value-by-path';

export function useStore<S extends AnyStore, T extends ExtractStoreProxyTarget<S>>(store: S): T;
export function useStore<S extends AnyStore, T extends ExtractStoreProxyTarget<S>, P extends ResourcePath<T>>(
	store: S,
	path: P
): Readonly<DefineTypeByPath<T, P>>;
export function useStore<
	S extends AnyStore,
	T extends ExtractStoreProxyTarget<S>,
	P extends ResourcePath<T> | void = void
>(store: S, path?: P): T | Readonly<DefineTypeByPath<T, P & string>> {
	const [, force] = useReducer((x) => !x, true);

	useEffect(() => {
		const untrack = store.track(() => force());
		return untrack;
	}, [store]);

	if (typeof path === 'string' && path.length) {
		return get_store_value_by_path(store, path);
	} else {
		return store.get();
	}
}
