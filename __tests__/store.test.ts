import { describe, expect, test } from 'vitest';
import { createStore, createEvent } from '../packages/core/src/core';

describe('store', () => {
	class Helper {
		constructor() {}
		say() {
			return 'test';
		}
	}

	test('mutable $ in .on & contain instance', () => {
		const helper_event = createEvent();
		const $ = createStore<{ instance?: Helper; text?: string }>({ instance: undefined, text: 'google' });
		$.on(helper_event, (store) => {
			store.instance = new Helper();
			store.text = undefined;
		});
		helper_event();

		const helper_instance_in_store = $.get().instance;

		expect(helper_instance_in_store).toBeInstanceOf(Helper);
		expect(helper_instance_in_store?.say()).toEqual('test');
		expect($.get().text).toBeUndefined();
	});

	test('createStore only with object || empty as initial', () => {
		expect(() => createStore(25 as any)).toThrowError();
		expect(() => createStore({})).not.toThrowError();
		expect(() => createStore()).not.toThrowError();
	});

	test('create with serializable values', () => {
		const initial = { ok: { google: 'world' } };
		const $ = createStore(initial);

		expect($.get()).toEqual(initial);
	});

	test('create with non-serializable values', () => {
		const $ = createStore({ ok: { user: new Helper(), map: new Map() } });

		expect($.get().ok.user).toBeInstanceOf(Helper);
		expect($.get().ok.map).toBeInstanceOf(Map);
	});

	test('should refer to the origin Instance', () => {
		const helper_event = createEvent();

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

	test('snapshot cannot be mutated', () => {
		const $ = createStore({
			deep_object: {
				instance: new Helper(),
			},
		});
		expect(() => ($.get().deep_object.instance = 'new deep text' as any)).toThrowError();
	});
});
