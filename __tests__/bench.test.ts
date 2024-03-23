import { describe, test } from 'vitest';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { createEvent as create_effector_event, createStore as create_effector_store } from 'effector';
import { createStore, createEvent } from '../packages/core/dist/core.js';

describe('bench', () => {
	const BENCH_TIMES = 50_000;

	test('x-shard', () => {
		console.log('---------> update 4 stores', BENCH_TIMES + ' times');
		console.time('x-shard');

		const event = createEvent<string>();
		const $ = createStore({ a: { b: { c: ' 12', d: '2', e: '2' } } });
		const $2 = createStore({ a: { b: { c: ' 12', d: '2', e: '2' } } });
		const $3 = createStore({ a: { b: { c: ' 12', d: '2', e: '2' } } });
		const $4 = createStore({ a: { b: { c: ' 12', d: '2', e: '2' } } });

		$.on(event, (store, payload) => {
			store.a.b.c = payload;
		});
		$2.on(event, (store, payload) => {
			store.a.b.c = payload;
		});
		$3.on(event, (store, payload) => {
			store.a.b.c = payload;
		});
		$4.on(event, (store, payload) => {
			store.a.b.c = payload;
		});
		$.track(() => {});
		$2.track(() => {});
		$3.track(() => {});
		$4.track(() => {});

		for (let i = 0; i < BENCH_TIMES; ++i) {
			event('test');
		}

		console.timeEnd('x-shard');
	});

	test('compare', () => {
		console.time('effector');
		const event = create_effector_event<string>();
		const $ = create_effector_store({ a: { b: { c: ' 12', d: '2', e: '2' } } });
		const $2 = create_effector_store({ a: { b: { c: ' 12', d: '2', e: '2' } } });
		const $3 = create_effector_store({ a: { b: { c: ' 12', d: '2', e: '2' } } });
		const $4 = create_effector_store({ a: { b: { c: ' 12', d: '2', e: '2' } } });

		$.on(event, (store, payload) => {
			return { a: { b: { ...store.a.b, c: payload } } };
		});
		$2.on(event, (store, payload) => {
			return { a: { b: { ...store.a.b, c: payload } } };
		});
		$3.on(event, (store, payload) => {
			return { a: { b: { ...store.a.b, c: payload } } };
		});
		$4.on(event, (store, payload) => {
			return { a: { b: { ...store.a.b, c: payload } } };
		});
		$.watch(() => {});
		$2.watch(() => {});
		$3.watch(() => {});
		$4.watch(() => {});
		for (let i = 0; i < BENCH_TIMES; ++i) {
			event('test');
		}
		console.timeEnd('effector');

		console.time('redux');
		const initialState = { a: { b: { c: ' 12', d: '2', e: '2' } } };
		const s = createSlice({
			name: 's',
			initialState,
			reducers: {
				updateTest: (state, action) => {
					state.a.b.c = action.payload;
				},
			},
		});
		const s2 = createSlice({
			name: 's2',
			initialState,
			reducers: {
				updateTest: (state, action) => {
					state.a.b.c = action.payload;
				},
			},
		});
		const s3 = createSlice({
			name: 's3',
			initialState,
			reducers: {
				updateTest: (state, action) => {
					state.a.b.c = action.payload;
				},
			},
		});
		const s4 = createSlice({
			name: 's4',
			initialState,
			reducers: {
				updateTest: (state, action) => {
					state.a.b.c = action.payload;
				},
			},
		});

		const store = configureStore({
			reducer: {
				s: s.reducer,
				s2: s2.reducer,
				s3: s3.reducer,
				s4: s4.reducer,
			},
		});

		for (let i = 0; i < BENCH_TIMES; ++i) {
			store.dispatch(s.actions.updateTest('s'));
			store.dispatch(s2.actions.updateTest('s'));
			store.dispatch(s3.actions.updateTest('s'));
			store.dispatch(s4.actions.updateTest('s'));
		}
		console.timeEnd('redux');
	});
});
