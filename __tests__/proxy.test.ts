import { describe, expect, test, vi } from 'vitest';
import { create_deep_immutable_proxy } from '../src/proxy';
import { createEvent, createStore } from '../src/core';

describe('proxy', () => {
	class Helper {}
	test('immutable', () => {
		const origin = {
			string: 'text',
			number: 18,
			boolean: true,
			n: null,
			u: undefined,
			big_int: BigInt(12),
			object: {},
			deep_object: {
				string: 'text',
				d: {
					s: '12',
				},
				instance: new Helper(),
			},
		};
		(origin as any).added = { a: '15' };
		const proxy = create_deep_immutable_proxy(origin);

		expect(() => ((proxy as any).added.a = 'new text')).toThrowError();
		expect(() => Reflect.deleteProperty(proxy, 'boolean')).toThrowError();
		expect(() => ((proxy as any).string = 'new text')).toThrowError();
		expect(() => ((proxy as any).number = 20)).toThrowError();
		expect(() => ((proxy as any).string = {} as any)).toThrowError();
		expect(() => ((proxy as any).number = 'text' as any)).toThrowError();
		expect(() => ((proxy as any).boolean = false)).toThrowError();
		expect(() => ((proxy as any).boolean = {} as any)).toThrowError();
		expect(() => ((proxy as any).n = 'not null' as any)).toThrowError();
		expect(() => ((proxy as any).n = undefined as any)).toThrowError();
		expect(() => ((proxy as any).u = 'not undefined' as any)).toThrowError();
		expect(() => ((proxy as any).u = undefined)).toThrowError();
		expect(() => ((proxy as any).big_int = BigInt(10))).toThrowError();
		expect(() => ((proxy.object as any).newProperty = 'new value')).toThrowError();
		expect(() => (proxy.deep_object.instance = 'new deep text' as any)).toThrowError();
		expect(() => (proxy.deep_object.d.s = 'new deep text' as any)).toThrowError();

		expect((proxy as any).added.a).toEqual('15');
	});

	test('flat mutable proxy', () => {
		const event = createEvent();
		const $ = createStore({
			prop: '12',
		});

		$.on(event, (store) => {
			store.prop = '12';
		});

		const watch_handler = vi.fn((snapshot: ReturnType<(typeof $)['get']>) => {
			expect(snapshot.prop).toEqual('12');
		});
		$.watch(watch_handler);

		event();

		expect(watch_handler).toHaveBeenCalledOnce();
	});

	test('deep mutable', () => {
		const event = createEvent();
		const $ = createStore({
			object: {
				deep: 'test',
				d: {
					a: 'b',
				},
			},
		});

		$.on(event, (store) => {
			store.object.deep = 'none';
			store.object.d.a = 'c';

			(store as any).custom = { a: '12' };
		});

		const watch_handler = vi.fn((snapshot: ReturnType<(typeof $)['get']>) => {
			expect((snapshot as any).custom.a).toEqual('12');

			expect(snapshot.object.deep).toEqual('none');
			expect(snapshot.object.d.a).toEqual('c');
		});
		$.watch(watch_handler);

		event();

		expect(watch_handler).toHaveBeenCalledOnce();
	});
});
