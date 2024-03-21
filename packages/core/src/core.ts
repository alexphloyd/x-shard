import { create_deep_immutable_proxy, create_deep_writable_proxy } from './proxy';
import { browser_event_target_map, mutated_proxies_map } from './maps';
import { unsafe_parse_object, is_string, is_synthetic_emitter, parse_browser_emitter } from './guards';

const system = new EventTarget();

const synthetic_event_keys_storage = new WeakMap<SyntheticEventEmitter<any>, string>();

const store_mutated_event_keys_storage = new WeakMap<ProxyTarget, string>();

export function createEvent<T extends SyntheticEventPayload | void = void>() {
	const key = crypto.randomUUID();
	const emitter = (payload: T) => {
		system.dispatchEvent(new CustomEvent(key, { detail: payload }));
	};

	synthetic_event_keys_storage.set(emitter, key);
	return emitter;
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

	return {
		/**
		 * @description $.get() return an immutable store snapshot
		 * */
		get: () => immutable_proxy,
		/**
		 * @description $.on(event, handler) - intended to handle emitted events.
		 * Could be used to emit subsequent events.
		 * */
		on: <E extends SyntheticEventEmitter<any> | BrowserEventEmitter>(
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
		 * @description $.subscribe(handler) - runs the handler after
		 * an entire chain of event handlers is completed and the store has changed.
		 * */
		track: (handler: (snapshot: typeof immutable_proxy) => void) => {
			trackers.push(handler);
			return () => {
				trackers = trackers.filter((t) => t !== handler);
			};
		},
	};
}

export interface ProxyTarget {
	[key: string]: any;
}

export type SyntheticEventEmitter<P extends SyntheticEventPayload | void = void> = ReturnType<
	typeof createEvent<P>
>;
export type SyntheticEventPayload = Record<string, any> | string | number | boolean | BigInt | null;

export type BrowserEventEmitter = `window:${keyof WindowEventMap}` | `document:${keyof DocumentEventMap}`;

export type ExtractEventPayload<E> = E extends SyntheticEventEmitter<any>
	? ExtractSyntheticEventPayload<E>
	: E extends BrowserEventEmitter
	? ExtractBrowserEventPayload<E>
	: never;

export type ExtractSyntheticEventPayload<E> = E extends SyntheticEventEmitter<infer P> ? P : never;

export type ExtractBrowserEventPayload<E> = E extends BrowserEventEmitter ? DefineBrowserEventPayload<E> : never;

export type DefineBrowserEventPayload<Emitter extends BrowserEventEmitter> =
	Emitter extends `${infer T extends BrowserEventTarget}:${infer E extends PossibleBrowserEvents}`
		? BrowserEventTargetMap<E>[T]
		: never;

export type BrowserEventTargetMap<E extends PossibleBrowserEvents> = {
	window: WindowEventMap[E];
	document: DocumentEventMap[E];
};

export type BrowserEventTarget = 'window' | 'document';
export type PossibleBrowserEvents = keyof DocumentEventMap & keyof WindowEventMap;

export type Listener<S extends ProxyTarget> = (snapshot: Readonly<S>) => void;
