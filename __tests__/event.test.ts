import { describe, expect, test, vi } from 'vitest';
import { createStore, createEvent } from '../packages/core/src/core';

describe('event', () => {
	test('create', () => {
		const create_event = vi.fn(createEvent);
		const event = create_event();

		expect(event).toBeTypeOf('function');
		expect(create_event).toHaveBeenCalledOnce();
	});

	test('should be consumed with payload', () => {
		const $ = createStore();
		const event = createEvent<{ ok: string }>();

		$.on(event, (_, payload) => {
			expect(event).toBeDefined();
			expect(payload).toStrictEqual({ ok: 'google' });
		});

		event({ ok: 'google' });
	});

	test('not related events should not trigger the STORE_CHANGED event', () => {
		const $ = createStore();
		vi.spyOn($, 'track');

		const event = createEvent();

		const tracker = vi.fn(() => {});
		$.track(tracker);

		event();

		expect(tracker).toHaveBeenCalledTimes(0);
	});
});
