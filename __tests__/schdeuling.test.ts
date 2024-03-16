import { describe, expect, test } from 'vitest';
import { createEvent, createStore } from '../src/core';

describe('scheduling', () => {
	interface Session {
		isVerified: boolean;
		id: number;
	}

	test('run all mutations after handler executed', () => {
		const $ = createStore<{ session?: Session }>({ session: undefined });
		const session_defined = createEvent<Session>();

		$.on(session_defined, (store, event) => {
			const start = store.session?.id;
			store.session = event.payload;
			const end = store.session?.id;

			expect(start).toEqual(end);
		});

		session_defined({ id: 12, isVerified: false });
		expect($.get().session?.id).toEqual(12);
	});

	test('super-test', () => {
		const $ = createStore<{ session?: Session }>({ session: undefined });

		const session_defined = createEvent<Session>();
		const try_certificate = createEvent();

		session_defined({ id: 12, isVerified: false });
		try_certificate();

		$.on(session_defined, (store, event) => {
			store.session = event.payload; // post_job
			console.log(store, 'before try');
			// try_certificate(); // why it execute jobs ? -> any event handler of $ execute existed jobs
			console.log(store, 'after try');
		});

		$.on(try_certificate, (store) => {
			console.log(store, 'IN TRY');
		});

		console.log('hello');
	});
});
