import { describe, expect, test, vi } from 'vitest';
import { createEvent, createStore } from '../src/core';

describe('event', () => {
	const $ = createStore({ hello: 'world' });
	const event_payload = { ok: 'google' };

	test('create', () => {
		const event = vi.fn(createEvent);
		event();

		expect(event).toBeDefined();
		expect(event).toHaveBeenCalledOnce();
	});

	test('should be consumed with payload', () => {
		const event = createEvent<{ ok: string }>();
		event(event_payload);

		$.on(event, (_store: any, event: any) => {
			expect(event).toBeDefined();
			expect(event.payload).toStrictEqual(event_payload);
		});
	});

	test('should not trigger STORE_CHANGED event', () => {
		const handler = vi.fn(() => {});

		const event = createEvent();
		event();

		$.watch((store) => {
			store.hello = '2';
		});

		expect(handler).toHaveBeenCalledTimes(0);
	});
});
