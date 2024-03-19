import { create_deep_immutable_proxy, create_deep_writable_proxy } from './proxy';
import { mutated_proxies_map } from './maps';
import { unsafe_parse_object } from './parse-object';

const system = new EventTarget();

const event_keys_storage = new WeakMap<EventEmitter<any>, string>();

const store_mutated_event_keys_storage = new WeakMap<ProxyTarget, string>();

export function createEvent<T extends EventPayload | void = void>() {
	const key = crypto.randomUUID();
	const emitter = (payload: T) => {
		system.dispatchEvent(new CustomEvent(key, { detail: payload }));
	};

	event_keys_storage.set(emitter, key);
	return emitter;
}

export function createStore<S extends ProxyTarget>(initial: S = {} as S) {
	const store_mutated_event_key = crypto.randomUUID();
	const proxy_target = unsafe_parse_object(initial);

	store_mutated_event_keys_storage.set(proxy_target, store_mutated_event_key);

	const $ = create_deep_writable_proxy(proxy_target);

	const immutable_proxy = create_deep_immutable_proxy(proxy_target);

	let is_handling_process = false;

	return {
		/**
		 * @description $.get() return an immutable store snapshot
		 * */
		get: () => immutable_proxy,
		/**
		 * @description $.on(event, handler) - allow to handle emitted events.
		 * Handler has an access to the writable store and event payload.
		 * */
		on: <E extends EventEmitter<any>>(
			event_emitter: E,
			handler: (store: typeof $, payload: ExtractEventPayload<E>) => void
		) => {
			const event_key = event_keys_storage.get(event_emitter);
			if (!event_key) return;

			function _handler(kernel_event: Event) {
				let is_child_process = is_handling_process;

				if (!is_child_process) {
					is_handling_process = true;
				}

				handler($, (kernel_event as CustomEvent).detail);

				if (!is_child_process) {
					if (mutated_proxies_map.get(proxy_target)) {
						system.dispatchEvent(new CustomEvent(store_mutated_event_key));
						mutated_proxies_map.set(proxy_target, false);
					}
					// finish handling process after executing all $ watchers
					is_handling_process = false;
				}
			}

			system.addEventListener(event_key, _handler);
		},
		/**
		 * @description $.watch(handler) - runs an effect after the store has changed.
		 * Handler has an access to immutable snapshot.
		 * */
		watch: (handler: (snapshot: typeof immutable_proxy) => void) => {
			const _handler = () => {
				handler(immutable_proxy);
			};
			system.addEventListener(store_mutated_event_key, _handler);
		},
	};
}

export interface ProxyTarget {
	[key: string]: any;
}

export type EventEmitter<P extends EventPayload | void = void> = ReturnType<typeof createEvent<P>>;

export type EventPayload = Record<string, any> | string | number | boolean | BigInt | null;

export type ExtractEventPayload<Emitter> = Emitter extends EventEmitter<infer P> ? P : never;

type BrowserEvent = `window:${keyof WindowEventMap}` | `document:${keyof DocumentEventMap}`;
