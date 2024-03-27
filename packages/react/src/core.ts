import { type Store } from '~/core/src/core';
import { useEffect, useReducer } from 'react';
import { get_store_value_by_path } from 'utils/get_store_value_by_path';

export function useStore<S extends Store>(store: S, path?: ResourcePath<ReturnType<S['get']>>) {
	const [, force] = useReducer((x) => !x, true);
	useEffect(() => {
		const untrack = store.track(() => force());
		return untrack;
	}, [store]);

	return path ? get_store_value_by_path(store, path) : store.get();
}
