import { describe, expect, test, vi } from 'vitest';
import { createEvent, createStore } from '../src/core';

describe('scheduling', () => {
	interface Session {
		isVerified: boolean;
		id: number;
		check?: boolean;
	}

	test('run mutations immediately', () => {
		const $ = createStore<{ session?: Session }>({ session: undefined });
		const session_defined = createEvent<Session>();

		$.on(session_defined, (store, event) => {
			const start = store.session?.id;
			store.session = event.payload;
			const end = store.session?.id;

			expect(start).not.toEqual(end);
		});

		session_defined({ id: 12, isVerified: false });
		expect($.get().session?.id).toEqual(12);
	});

	test('should emit about mutations once with nested events', async () => {
		const $ = createStore<{ session?: Session }>({ session: undefined });
		const handler = vi.fn(() => {});
		$.watch(handler);

		const session_defined = createEvent<Session>();
		const try_certificate = createEvent();

		$.on(session_defined, (store, event) => {
			store.session = event.payload;
			store.session = { ...event.payload, check: true };

			try_certificate();

			if (store.session.isVerified) {
				store.session.id = 1;
			}
		});

		$.on(try_certificate, (store) => {
			if (store.session) {
				store.session.isVerified = true;
			}
		});

		session_defined({ id: 12, isVerified: false });

		const mutated_session = $.get().session;
		expect(mutated_session?.id).toEqual(1);
		expect(mutated_session?.isVerified).toEqual(true);
		expect(mutated_session?.check).toEqual(true);

		expect(handler).toHaveBeenCalledOnce();
	});

	test('should not overlap each other', async () => {
		const $ = createStore<{ session?: Session }>({ session: undefined });
		const handler = vi.fn(() => {});
		$.watch(handler);

		const session_defined = createEvent<Session>();
		const try_certificate = createEvent();
		const breaker = createEvent();
		const aside = createEvent();

		$.on(session_defined, (store, event) => {
			store.session = event.payload; // set twice
			store.session = { ...event.payload, check: true };

			try_certificate();

			if (store.session.isVerified) {
				store.session.id = 1;
			}
		});

		$.on(try_certificate, (store) => {
			if (store.session) {
				store.session.isVerified = true;
			}
		});

		$.on(breaker, (store) => {
			const curr = store.session;
			expect(curr?.id).toEqual(1);
			expect(curr?.isVerified).toEqual(true);
			expect(curr?.check).toEqual(true);

			store.session = undefined;
			store.session = { id: 401, isVerified: false };
		});

		$.watch((snapshot) => {
			if (snapshot.session?.check) {
				breaker();
			}
		});

		$.on(aside, (store) => {
			expect(store.session?.id).toEqual(401);
		});

		session_defined({ id: 12, isVerified: false });
		aside();

		const mutated_session_id = $.get().session?.id;
		expect(mutated_session_id).toEqual(401);

		expect(handler).toHaveBeenCalledOnce();
	});
});
