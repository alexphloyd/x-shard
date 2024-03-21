import { describe, expect, test, vi } from 'vitest';
import { createEvent, createStore } from '../packages/core/src/core';

describe('.track', () => {
	test('contain snapshot', () => {
		const $ = createStore({ times: 0 });
		const event = createEvent();

		$.on(event, (store) => {
			store.times = 1;
		});

		$.track((snapshot) => {
			expect(snapshot).toBeDefined();
			expect(snapshot.times).toEqual(1);
		});

		event();
	});

	test('do untrack', () => {
		const $ = createStore({ times: 0 });
		const event = createEvent();

		$.on(event, (store) => {
			store.times += 1;
		});

		const handler = vi.fn(() => {});
		const untrack = $.track(handler);

		event();
		untrack();
		event();

		expect(handler).toHaveBeenCalledOnce();
	});
});
