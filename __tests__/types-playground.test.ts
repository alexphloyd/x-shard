import { describe, test } from 'vitest';
import { createEvent, createStore } from '../src/core';

describe('types', () => {
	test('event type in $.on()', () => {
		const $ = createStore();
		const event = createEvent<{ ok: { hello: string } }>();
		event({ ok: { hello: 's' } });

		$.on(event, (store, event) => {
			event.payload.ok.hello;
			store.a = 12;
		});
	});
});
