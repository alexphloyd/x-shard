import { create_deep_immutable_proxy, parse_proxy_target } from './utils';

// K: emitter, V: event_key
const event_keys_storage = new WeakMap<EventEmitter<any>, string>();

// K: proxy_target, V: event_key
const store_changed_event_keys_storage = new WeakMap<ProxyTarget, string>();

const create_scheduler = () => {
	const jobs = new Map<ProxyTarget, Array<Job>>();

	return {
		init_target(target: ProxyTarget) {
			jobs.set(target, []);
		},
		post_job(target: ProxyTarget, job: Job) {
			jobs.get(target)?.push(job);
		},
		execute_jobs(target: ProxyTarget) {
			const target_jobs = jobs.get(target);
			const event_key = store_changed_event_keys_storage.get(target);

			if (target_jobs?.length && event_key) {
				target_jobs.forEach((job) => job());
				document.dispatchEvent(new Event(event_key));
			}
		},
	};
};

export const scheduler = create_scheduler();

export function createEvent<T extends EventPayload | void = void>() {
	const key = crypto.randomUUID();
	const emitter = (payload: T) => {
		document.dispatchEvent(new CustomEvent(key, { detail: payload }));
	};

	event_keys_storage.set(emitter, key);
	return emitter;
}

export function createStore<S extends ProxyTarget>(initial: S = {} as S) {
	const store_changed_event_key = crypto.randomUUID();
	const proxy_target = parse_proxy_target(initial);

	scheduler.init_target(proxy_target);
	store_changed_event_keys_storage.set(proxy_target, store_changed_event_key);

	const $ = new Proxy(proxy_target, {
		get(target, prop) {
			return target[prop as keyof S];
		},
		set(target, prop, passed_value) {
			scheduler.post_job(proxy_target, () => (target[prop as keyof S] = passed_value));
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
				event: {
					payload: ExtractEventPayload<E>;
				}
			) => void
		) => {
			const event_key = event_keys_storage.get(event_emitter);
			const _handler = (kernel_event: CustomEvent) => {
				handler($, { payload: kernel_event.detail });
				scheduler.execute_jobs(proxy_target);
			};

			document.addEventListener(event_key as any, _handler); // event key type?
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

interface ProxyTarget {
	[key: string]: any;
}

type EventEmitter<P extends EventPayload | void = void> = ReturnType<typeof createEvent<P>>;

type EventPayload = Record<string, any> | string | number | boolean | BigInt | null;

type ExtractEventPayload<Emitter> = Emitter extends EventEmitter<infer P> ? P : never;

type Job = () => void;
