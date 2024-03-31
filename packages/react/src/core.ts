import { useEffect, useReducer, useRef } from 'react';
import { get_store_value_by_path } from 'utils/get-store-value-by-path';
import { type DefineTypeByPath, type ResourcePath } from 'utils/shared-types';
import { type AnyStore, type ExtractStoreProxyTarget } from 'x-shard';

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
	const [, render] = useReducer((x) => !x, true);

	const prev = useRef<T | Readonly<DefineTypeByPath<T, P & string>>>();
	const next = useRef<T | Readonly<DefineTypeByPath<T, P & string>>>(_get());

	function _next() {
		next.current = _get();
	}
	function _get() {
		if (typeof path === 'string' && path.length) {
			return get_store_value_by_path(store, path);
		} else {
			return store.get();
		}
	}

	useEffect(() => {
		const untrack = store.track(() => {
			_next();

			if (next.current !== prev.current) {
				prev.current = next.current;
				render();
			}
		});
		return untrack;
	}, []);

	return next.current;
}
