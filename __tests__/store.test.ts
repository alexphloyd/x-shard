import { describe, expect, test } from 'vitest';
import { createEvent, createStore } from '../src/core';

describe('store', () => {
	const helper_event = createEvent();
	class User {
		constructor() {}
		say() {
			return 'hello';
		}
	}

	test('allow to create only with object as initial', () => {
		expect(() => createStore(25 as any)).toThrowError();
		expect(() => createStore({})).not.toThrowError();
	});

	test('create with serializable values', () => {
		const $ = createStore({ ok: { s: 'text' } });
		expect($.get().ok.s).toStrictEqual('text');
	});

	test('create with non-serializable values', () => {
		const $ = createStore({ ok: { user: new User(), map: new Map() } });

		expect($.get().ok.user).toBeInstanceOf(User);
		expect($.get().ok.map).toBeInstanceOf(Map);
	});

	test('should mutate origin Map', () => {
		const map_ref = new Map();
		map_ref.set('ok', 'google');

		const $ = createStore({ map_instance: map_ref });
		$.get().map_instance.set('hello', 'world');

		$.on(helper_event, (store) => {
			const init_map_value_in_store = store.map_instance.get('ok');
			const value_passed_by_store = store.map_instance.get('hello');

			expect(init_map_value_in_store).toBeDefined();
			expect(value_passed_by_store).toBeDefined();
		});

		const passed_value_in_origin_map = map_ref.get('hello');
		expect(passed_value_in_origin_map).toStrictEqual('world');

		helper_event();
	});
});
