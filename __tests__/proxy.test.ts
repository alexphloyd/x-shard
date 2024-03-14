import { describe, expect, test, vi } from 'vitest';
import { create_deep_immutable_proxy } from '../src/proxy';
import { createEvent, createStore, scheduler } from '../src/core';

describe('proxy', () => {
	test('immutable', () => {
		class Helper {}
		const proxy = create_deep_immutable_proxy({
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
		});

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
	});

	test('deep mutation should trigger change_event', () => {
		const event = createEvent();
		const $ = createStore({
			object: {
				deep: 'test',
			},
			prop: '12',
		});

		$.on(event, (store) => {
			store.prop = '12';
			// store.object.deep = 'none';
			// store.object.deep = 'second';
		});

		// const watch_handler = vi.fn((snapshot: ReturnType<(typeof $)['get']>) => {
		// 	expect(snapshot.object.deep).toEqual('second');
		// });
		// $.watch(watch_handler);
		$.watch((s) => {
			console.log(s);
		});

		event();

		const spy_scheduler = vi.spyOn(scheduler, 'execute_jobs');
		expect(spy_scheduler).toHaveBeenCalledOnce();
		// console.log($.get());
		// expect(watch_handler).toHaveBeenCalledOnce();
	});
});
