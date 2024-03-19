import { describe, expect, test, vi } from 'vitest';
import { createStore, createEvent } from '../packages/core/src/core';

describe('event', () => {
	test('create', () => {
		const create_event = vi.fn(createEvent);
		const event = vi.fn(create_event());
		event();

		expect(event).toHaveBeenCalledOnce();
		expect(create_event).toHaveBeenCalledOnce();
	});

	test('should be consumed with payload', () => {
		const $ = createStore();
		const event = createEvent<{ ok: string }>();
		event({ ok: 'google' });

		$.on(event, (_, payload) => {
			expect(event).toBeDefined();
			expect(payload).toStrictEqual({ ok: 'google' });
		});
	});

	test('not related events should not trigger the STORE_CHANGED event', () => {
		const $ = createStore();
		vi.spyOn($, 'watch');

		const event = createEvent();
		event();

		const mocked_handler = vi.fn(() => {});
		$.watch(mocked_handler);

		expect(mocked_handler).toHaveBeenCalledTimes(0);
		expect($.watch).toHaveBeenCalledTimes(1);
	});
});
