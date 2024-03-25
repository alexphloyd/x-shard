import { describe, expect, test, vi } from 'vitest';
import { createStore, createEvent } from '~/core/src/core';

describe('scheduling', () => {
	test('run mutations immediately', () => {
		const $ = createStore<{ times: number }>({ times: 0 });
		const event = createEvent();
		$.on(event, (store) => {
			store.times = 1;
			expect(store.times).toEqual(1);
		});
		event();
	});

	test('emit about mutations once with nested events without overlapping', async () => {
		const $ = createStore<{ mutated_times: number }>({ mutated_times: 0 });

		const first = createEvent();
		const second = createEvent();
		const third = createEvent();

		$.on(first, (store) => {
			store.mutated_times = 1;
			second();
			store.mutated_times = 3;
		});

		$.on(second, (store) => {
			expect(store.mutated_times).toEqual(1);
			store.mutated_times = 2;
		});

		$.on(third, (store) => {
			store.mutated_times = 4;
		});

		const track_handler = vi.fn(() => {});
		$.track(track_handler);

		first();
		third();

		const mutated_times = $.get().mutated_times;
		expect(mutated_times).toEqual(4);

		expect(track_handler).toHaveBeenCalledTimes(2);
	});
});
