import { describe, expect, test, vi } from 'vitest';
import { create_deep_immutable_proxy } from '~/core/src/proxy';
import { createStore, createEvent } from '~/core/src/core';

describe('proxy', () => {
	class Helper {}
	test('immutable cannot be mutated', () => {
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

	test('deep mutable', () => {
		const do_mutation = createEvent();
		const $ = createStore({
			flat: '0',
			object: {
				deep: 'test',
				d: {
					a: 'b',
				},
			},
		});

		$.on(do_mutation, (store) => {
			store.object.deep = 'none';
			store.object.d.a = 'c';
			store.flat = '17';
			(store as any).custom = { a: '12' };
		});

		const tracker = vi.fn((snapshot: ReturnType<(typeof $)['get']>) => {
			expect((snapshot as any).custom.a).toEqual('12');
			expect(snapshot.flat).toEqual('17');
			expect(snapshot.object.deep).toEqual('none');
			expect(snapshot.object.d.a).toEqual('c');
		});
		$.track(tracker);

		do_mutation();

		expect(tracker).toHaveBeenCalledOnce();
	});
});
