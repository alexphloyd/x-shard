import { describe, test } from 'vitest';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { createStore, createEvent } from '../src/core';

describe('bench', () => {
	test('bench event', () => {
		console.time('shark');
		const $ = createStore({ a: { b: { c: ' 12', d: '2', e: '2' } } });
		const event = createEvent<string>();

		$.on(event, (store, event) => {
			store.a.b.c = event.payload;
			store.a.b.d = event.payload + 5;
			store.a.b.e = event.payload + 15;
		});

		for (let i = 0; i < 10_000; ++i) {
			event('test');
		}

		console.timeEnd('shark');
	});

	test('redux', () => {
		console.time('redux');
		const initialState = { a: { b: { c: ' 12', d: '2', e: '2' } } };
		const testSlice = createSlice({
			name: 'test',
			initialState,
			reducers: {
				updateTest: (state, action) => {
					state.a.b.c = action.payload;
					state.a.b.d = action.payload + 5;
					state.a.b.e = action.payload + 15;
				},
			},
		});
		const store = configureStore({
			reducer: {
				test: testSlice.reducer,
			},
		});

		for (let i = 0; i < 10_000; ++i) {
			store.dispatch(testSlice.actions.updateTest('s'));
		}
		console.timeEnd('redux');
	});
});
