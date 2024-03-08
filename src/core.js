const event_keys_storage = new WeakMap();

export function createEvent() {
	const key = crypto.randomUUID();
	const emitter = (payload) => {
		document.dispatchEvent(new CustomEvent(key, { detail: payload }));
	};

	event_keys_storage.set(emitter, key);
	return emitter;
}

export function createStore(initial) {
	const store_changed_event_key = crypto.randomUUID();

	const $ = new Proxy(structuredClone(initial ?? {}), {
		get(target, prop) {
			return target[prop];
		},
		set(target, prop, val) {
			target[prop] = val;
			document.dispatchEvent(new Event(store_changed_event_key));
		},
	});

	return {
		/*
		 * access to store
		 * */
		get: (prop) => $[prop],
		/*
		 * handle emitted events
		 * */
		on: (event_emitter, handler) => {
			document.addEventListener(
				event_keys_storage.get(event_emitter),
				(kernel_event) => handler($, { payload: kernel_event.detail })
			);
		},
		/*
		 * allow to track store changes
		 * */
		watch: (handler) => {
			document.addEventListener(store_changed_event_key, () =>
				handler($)
			);
		},
		__html__bind__subscribe(target, prop) {
			function updateTarget() {
				target.innerHTML = $[prop];
			}

			document.addEventListener(store_changed_event_key, updateTarget);
			updateTarget();

			return {
				unsubscribe() {
					document.removeEventListener(
						store_changed_event_key,
						updateTarget
					);
				},
			};
		},
	};
}
