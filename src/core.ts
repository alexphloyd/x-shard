import { create_deep_immutable_proxy, parse_proxy_target } from './utils';

const event_keys_storage = new WeakMap();

export function createEvent<T extends EventPayload | void = void>() {
	const key = crypto.randomUUID();
	const emitter = (payload: T) => {
		document.dispatchEvent(new CustomEvent(key, { detail: payload }));
	};

	event_keys_storage.set(emitter, key);
	return emitter;
}

export function createStore<S extends StoreInterface>(initial: S = {} as S) {
	const store_changed_event_key = crypto.randomUUID();
	const proxy_target = parse_proxy_target(initial);

	const $ = new Proxy(proxy_target, {
		get(target, prop) {
			return target[prop as keyof S];
		},
		set(target, prop, passed_value) {
			target[prop as keyof S] = passed_value;
			document.dispatchEvent(new Event(store_changed_event_key));
			return true;
		},
	});

	const immutable_proxy = create_deep_immutable_proxy(proxy_target);

	return {
		/**
		 * @description $.get() allow to get an immutable store snapshot
		 * */
		get: () => immutable_proxy,
		/**
		 * @description $.on(event, handler) - allow to handle emitted events.
		 * Handler has an access to the store and event details.
		 * */
		on: <E extends EventEmitter<any>>(
			event_emitter: E,
			handler: (
				store: typeof $,
				snapshot: typeof immutable_proxy,
				event: {
					payload: ExtractEventPayload<E>;
				}
			) => void
		) => {
			const event_key = event_keys_storage.get(event_emitter);
			const _handler = (kernel_event: CustomEvent) =>
				handler($, immutable_proxy, { payload: kernel_event.detail });

			document.addEventListener(event_key, _handler);
		},
		/**
		 * @description $.watch() allows running an effect after the store has changed.
		 * Handler has an access to the store and it's snapshot.
		 * */
		watch: (handler: (snapshot: typeof immutable_proxy) => void) => {
			document.addEventListener(store_changed_event_key, () => handler(immutable_proxy));
		},
	};
}

interface StoreInterface {
	[key: string]: any;
}

type EventEmitter<P extends EventPayload | void = void> = ReturnType<typeof createEvent<P>>;

type EventPayload = Record<string, any> | string | number | boolean;

type ExtractEventPayload<Emitter> = Emitter extends EventEmitter<infer P> ? P : never;
