const display = document.querySelector("#display");
const upper = document.querySelector("#upper");
const input = document.querySelector("#input");
const unsubscribe = document.querySelector("#unsubscribe");

const event_keys_storage = new WeakMap();

function createEvent() {
	const key = crypto.randomUUID();
	const emitter = (payload) => {
		document.dispatchEvent(new CustomEvent(key, { detail: payload }));
	};

	event_keys_storage.set(emitter, key);
	return emitter;
}

function createStore(initial) {
	const store_changed_event_key = crypto.randomUUID();

	// TODO: clone or ref ?
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

// ----------------------------

const name_changed = createEvent();
const upper_case_needed = createEvent();
const app_launched = createEvent();

const $regular = createStore({ name: "Alex" });
const $upper = createStore({ upperCased: "" });

const map_ref = new Map();
map_ref.set("ok", "google");

const $no_serializable = createStore({ map_instance: map_ref });
$no_serializable.get("map_instance").set("name", "alex");

$no_serializable.on(app_launched, (store) => {
	console.log(store.map_instance.get("name")); // -> alex
	console.log(store.map_instance.get("ok")); // -> google
});

console.log(map_ref.get("name"));
// $ store cloned value -> name is undef -> to force use value from store -> ?? ref_map still alive

$upper.on(app_launched, (store) => {
	store.upperCased = $regular.get("name")?.toUpperCase() ?? "";
});

$regular.on(name_changed, (store, event) => {
	store.name = event.payload ?? "";
	upper_case_needed();
});
$upper.on(upper_case_needed, (store) => {
	store.upperCased = $regular.get("name")?.toUpperCase() ?? "";
});

$regular.watch((store) => {
	console.log("$regular", store);
});
$upper.watch((store) => {
	console.log("$upper", store);
});

app_launched();

// ----------------

const reactive_regular = $regular.__html__bind__subscribe(display, "name");
const reactive_upper = $upper.__html__bind__subscribe(upper, "upperCased");

input.addEventListener("input", ({ target }) => {
	name_changed(target.value);
});

unsubscribe.addEventListener("click", () => {
	reactive_regular.unsubscribe();
	reactive_upper.unsubscribe();
});
