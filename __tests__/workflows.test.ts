import { describe, expect, test } from 'vitest';
import { createEvent, createStore } from '../src/core';

describe('workflows', () => {
	interface Session {
		isVerified: boolean;
		id: number;
	}
	test('base scheduling', () => {
		const $ = createStore<{ session?: Session }>({ session: undefined });
		const $another = createStore();

		const session_defined = createEvent<Session>();

		$.on(session_defined, (store, event) => {
			if (store.session) {
				// store prop as snapshot and writable instance
				$another.get(); // another immutable snapshot
			}

			const start = store.session?.id;

			store.session = event.payload;

			const end = store.session?.id;

			expect(start).toEqual(end);
		});

		session_defined({ id: 12, isVerified: false });
	});
});
