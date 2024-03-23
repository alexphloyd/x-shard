import { useEffect, useReducer } from 'react';
import { createStore } from 'x-shard';

export function useStore<T extends ReturnType<typeof createStore>>(store: T) {
	const [, force] = useReducer((x) => !x, true);
	useEffect(() => {
		const untrack = store.track(() => force());
		return untrack;
	}, [store]);

	return store.get() as ReturnType<T['get']>;
}
