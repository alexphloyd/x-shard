import { describe, expect, test, vi } from 'vitest';
import { createEvent, createStore } from '../src/core.js';

describe('event', () => {
	const $ = createStore();
	const event_payload = { ok: 'google' };

	test('create', () => {
		const event = vi.fn(createEvent);
		event();

		expect(event).toBeDefined();
		expect(event).toHaveBeenCalledOnce();
	});

	test('should be consumed with payload', () => {
		const event = createEvent();
		$.on(event, (_store, event) => {
			expect(event).toBeDefined();
			expect(event.payload).toStrictEqual(event_payload);
		});
		event(event_payload);
	});

	test('should not trigger STORE_CHANGED event', () => {
		const handler = vi.fn(() => {});
		const event = createEvent();

		$.watch(handler);
		event();

		expect(handler).toHaveBeenCalledTimes(0);
	});
});
