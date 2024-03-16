import { describe, test } from 'vitest';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { createStore, createEvent } from '../src/core';

describe('bench', () => {
	const BENCH_TIMES = 35_000;

	test('s', () => {
		console.log('---------> update 4 store', BENCH_TIMES + ' times');
		console.time('s');

		const event = createEvent<string>();
		const $ = createStore({ a: { b: { c: ' 12', d: '2', e: '2' } } });
		const $2 = createStore({ a: { b: { c: ' 12', d: '2', e: '2' } } });
		const $3 = createStore({ a: { b: { c: ' 12', d: '2', e: '2' } } });
		const $4 = createStore({ a: { b: { c: ' 12', d: '2', e: '2' } } });

		$.on(event, (store, event) => {
			store.a.b.c = event.payload;
		});
		$2.on(event, (store, event) => {
			store.a.b.c = event.payload;
		});
		$3.on(event, (store, event) => {
			store.a.b.c = event.payload;
		});
		$4.on(event, (store, event) => {
			store.a.b.c = event.payload;
		});

		for (let i = 0; i < BENCH_TIMES; ++i) {
			event('test');
		}

		console.timeEnd('s');
	});

	test('redux', () => {
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
