import { create_deep_immutable_proxy, create_deep_writable_proxy } from './proxy';
import { browser_event_target_map, mutated_proxies_map } from './maps';
import { unsafe_parse_object, is_string, is_synthetic_emitter, parse_browser_emitter } from './guards';

const system = new EventTarget();

const synthetic_event_keys_storage = new WeakMap<SyntheticEventEmitter<any>, string>();

const store_mutated_event_keys_storage = new WeakMap<ProxyTarget, string>();

export function createEvent<T extends SyntheticEventPayload | void = void>() {
	const key = crypto.randomUUID();

	function emitter(payload: T) {
		system.dispatchEvent(new CustomEvent(key, { detail: payload }));
	}
	synthetic_event_keys_storage.set(emitter as SyntheticEventEmitter<T>, key);

	return emitter as SyntheticEventEmitter<T>;
}

export function createStore<S extends ProxyTarget>(initial: S = {} as S) {
	const store_mutated_event_key = crypto.randomUUID();
	const proxy_target = unsafe_parse_object(initial);

	store_mutated_event_keys_storage.set(proxy_target, store_mutated_event_key);

	const $ = create_deep_writable_proxy(proxy_target);

	const immutable_proxy = create_deep_immutable_proxy(proxy_target);

	let is_handling_process = false;

	let trackers: Array<Listener<S>> = [];
	function exec_trackers() {
		for (let i = 0; i < trackers.length; ++i) {
			trackers[i](immutable_proxy);
		}
	}

	const store_interface = {
		/**
		 * @description $.get() return an immutable store snapshot
		 * */
		get: () => immutable_proxy,
		/**
		 * @description $.on(event, handler) - intended to handle emitted events.
		 * Could be used to emit subsequent events.
		 * */
		on: <E extends SyntheticEventEmitter<any> | NativeEventEmitter>(
			event_emitter: E,
			handler: (store: typeof $, payload: ExtractEventPayload<E>) => void
		) => {
			function _handler(payload: any) {
				let is_child_process = is_handling_process;
				if (!is_child_process) {
					is_handling_process = true;
				}

				handler($, payload);

				if (!is_child_process) {
					is_handling_process = false;
					const has_been_mutated = mutated_proxies_map.get(proxy_target);

					if (has_been_mutated) {
						mutated_proxies_map.set(proxy_target, false);
						exec_trackers();
					}
				}
			}

			if (is_synthetic_emitter(event_emitter)) {
				const key = synthetic_event_keys_storage.get(event_emitter);
				if (key) {
					system.addEventListener(key, (ev) => _handler((ev as CustomEvent).detail));
				}
			} else if (is_string(event_emitter)) {
				const { target, event } = parse_browser_emitter(event_emitter);
				browser_event_target_map[target].addEventListener(event, _handler);
			}
		},
		/**
		 * @description $.track(handler) - runs the handler after
		 * an entire chain of event handlers is completed and the store has changed.
		 * */
		track: (handler: (snapshot: typeof immutable_proxy) => void) => {
			trackers.push(handler);
			return () => {
				trackers = trackers.filter((t) => t !== handler);
			};
		},
	};

	return store_interface as Brand<typeof store_interface, 'store'>;
}

/*
 * Store definition
 * */
export interface ProxyTarget {
	[key: string]: any;
}
export type AnyStore<T extends ProxyTarget = any> = ReturnType<typeof createStore<T>>;
export type ExtractStoreProxyTarget<S extends ProxyTarget> = typeof createStore extends (target: S) => any
	? ReturnType<S['get']>
	: never;

const a = createStore({ a: 12 });
type a = ExtractStoreProxyTarget<typeof a>;

/*
 * Synthetic Event definition
 * */
export type SyntheticEventEmitter<P extends SyntheticEventPayload | void = void> = Brand<
	(payload: P) => void,
	'synthetic_event_emitter'
>;
export type SyntheticEventPayload = Record<string, any> | string | number | boolean | BigInt | null;

/*
 * Native Browser Event definition
 * */

export type NativeEventEmitter = `window:${keyof WindowEventMap}` | `document:${keyof DocumentEventMap}`;

export type NativeEventTargetMap<E extends NativeEventsMap> = {
	window: WindowEventMap[E];
	document: DocumentEventMap[E];
};

export type NativeEventTarget = 'window' | 'document';
export type NativeEventsMap = keyof DocumentEventMap & keyof WindowEventMap;

/*
 * Event payloads
 * */
export type ExtractEventPayload<E> = E extends SyntheticEventEmitter<any>
	? ExtractSyntheticEventPayload<E>
	: E extends NativeEventEmitter
	? ExtractBrowserEventPayload<E>
	: never;

export type ExtractSyntheticEventPayload<E> = E extends SyntheticEventEmitter<infer P> ? P : never;

export type ExtractBrowserEventPayload<E> = E extends NativeEventEmitter ? DefineBrowserEventPayload<E> : never;

export type DefineBrowserEventPayload<Emitter extends NativeEventEmitter> =
	Emitter extends `${infer T extends NativeEventTarget}:${infer E extends NativeEventsMap}`
		? NativeEventTargetMap<E>[T]
		: never;

/*
 * Listener definition
 * */
export type Listener<S extends ProxyTarget> = (snapshot: Readonly<S>) => void;
