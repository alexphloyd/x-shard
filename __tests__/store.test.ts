import { describe, expect, test } from 'vitest';
import { createEvent, createStore } from '../src/core';

describe('store', () => {
	const helper_event = createEvent();
	class Helper {
		constructor() {}
		say() {
			return 'test';
		}
	}

	test('snapshot cannot be mutated', () => {
		const $ = createStore({
			string: 'text',
			number: 18,
			boolean: true,
			n: null,
			u: undefined,
			big_int: BigInt(12),
			object: {},
			deep_object: {
				string: 'text',
				instance: new Helper(),
			},
		});
		const snapshot = $.get();

		expect(() => (snapshot.string = 'new text')).toThrowError();
		expect(() => (snapshot.string = {} as any)).toThrowError();
		expect(() => (snapshot.number = 20)).toThrowError();
		expect(() => (snapshot.number = 'text' as any)).toThrowError();
		expect(() => (snapshot.boolean = false)).toThrowError();
		expect(() => (snapshot.boolean = {} as any)).toThrowError();
		expect(() => (snapshot.n = 'not null' as any)).toThrowError();
		expect(() => (snapshot.n = undefined as any)).toThrowError();
		expect(() => (snapshot.u = 'not undefined' as any)).toThrowError();
		expect(() => (snapshot.u = undefined)).toThrowError();
		expect(() => (snapshot.big_int = BigInt(10))).toThrowError();
		expect(() => ((snapshot.object as any).newProperty = 'new value')).toThrowError();
		expect(() => (snapshot.deep_object.instance = 'new deep text' as any)).toThrowError();

		expect($.get()).toEqual(snapshot);
	});

	test('allow to create only with object as initial', () => {
		expect(() => createStore(25 as any)).toThrowError();
		expect(() => createStore({})).not.toThrowError();
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
