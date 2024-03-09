const event_keys_storage = new WeakMap();

export function createEvent<T extends EventPayload | void = void>() {
	const key = crypto.randomUUID();
	const emitter = (payload: T) => {
		document.dispatchEvent(new CustomEvent(key, { detail: payload }));
	};

	event_keys_storage.set(emitter, key);
	return emitter;
}

type EventEmitter<P extends EventPayload | void = void> = ReturnType<
	typeof createEvent<P>
>;

export function createStore<T extends ProxyTarget>(initial?: T) {
	const store_changed_event_key = crypto.randomUUID();
	const proxy_target = initial
		? structuredClone(parse_proxy_target(initial))
		: {};

	const $ = new Proxy(proxy_target as T, {
		get(target, prop) {
			return target[prop as keyof T];
		},
		set(target, prop, passed_value) {
			target[prop as keyof T] = passed_value;
			document.dispatchEvent(new Event(store_changed_event_key));
			return Boolean(passed_value);
		},
	});

	return {
		/**
		 * @description $.get() allow to get a store instance
		 * */
		get: (prop?: keyof T) => (prop ? $[prop] : $),
		/**
		 * @description $.on(event, handler) - allow to handle emitted events.
		 * Handler has an access to the store and event details.
		 * */
		on: <
			E extends EventEmitter<any>,
			P extends Parameters<EventEmitter<Parameters<E>[0]>>[0]
		>(
			event_emitter: E,
			handler: (
				store: typeof $,
				event: {
					payload: P;
				}
			) => void
		) => {
			document.addEventListener(
				event_keys_storage.get(event_emitter),
				(kernel_event) => handler($, { payload: kernel_event.detail })
			);
		},
		/**
		 * @description $.watch() allows running an effect after the store has changed.
		 * Handler has an access to the store.
		 * */
		watch: (handler: (store: typeof $) => void) => {
			document.addEventListener(store_changed_event_key, () =>
				handler($)
			);
		},
	};
}

export function parse_proxy_target(value: unknown) {
	const is_valid =
		value instanceof Object &&
		!(value instanceof Map) &&
		!(value instanceof Set) &&
		!(value instanceof Array);
	if (!is_valid)
		throw new Error(
			`Initial store value should be an object. 
			 You can store non-serializable values as $store property.`
		);
	return value;
}

interface ProxyTarget {
	[key: string]: unknown;
}

type EventPayload = Record<string, unknown> | string | number | boolean;
