import { describe, expect, test, vi } from 'vitest';
import { createStore, createEvent } from '../packages/core/src/core';

describe('scheduling', () => {
	interface Session {
		isVerified: boolean;
		id: number;
		check?: boolean;
	}

	test('run mutations immediately', () => {
		const $ = createStore<{ session?: Session }>({ session: undefined });
		const session_defined = createEvent<Session>();

		$.on(session_defined, (store, payload) => {
			const start = store.session?.id;
			store.session = payload;
			const end = store.session?.id;

			expect(start).not.toEqual(end);
		});

		session_defined({ id: 12, isVerified: false });
		expect($.get().session?.id).toEqual(12);
	});

	test('should emit about mutations once with nested events', async () => {
		const $ = createStore<{ session?: Session }>({ session: undefined });
		const handler = vi.fn(() => {});
		$.track(handler);

		const session_defined = createEvent<Session>();
		const try_certificate = createEvent();

		$.on(session_defined, (store, payload) => {
			store.session = payload;
			store.session = { ...payload, check: true };

			try_certificate();

			if (store.session?.isVerified) {
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
		$.track(handler);

		const session_defined = createEvent<Session>();
		const try_certificate = createEvent();
		const breaker = createEvent();
		const aside = createEvent();

		$.on(session_defined, (store, payload) => {
			store.session = payload; // set twice
			store.session = { ...payload, check: true };

			try_certificate();

			if (store.session?.isVerified) {
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

		$.on(aside, (store) => {
			expect(store.session?.id).toEqual(401);

			if (store.session) {
				store.session.id = 0;
			}
		});

		$.track((snapshot) => {
			if (snapshot.session?.check) {
				breaker();
			}
		});

		session_defined({ id: 12, isVerified: false });
		aside();

		const mutated_session_id = $.get().session?.id;
		expect(mutated_session_id).toEqual(0);

		expect(handler).toHaveBeenCalledTimes(2);
	});
});
