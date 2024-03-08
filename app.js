const display = document.querySelector("#display");
const upper = document.querySelector("#upper");
const input = document.querySelector("#input");
const unsubscribe = document.querySelector("#unsubscribe");

function createEvent() {
	const key = crypto.randomUUID();
	return {
		emit(payload) {
			document.dispatchEvent(new CustomEvent(key, { detail: payload }));
		},
		key,
	};
}

function createStore(initial) {
	const store_changed_event_key = crypto.randomUUID();

	// TODO: only serializable values as Proxy target
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
		get: (prop) => $[prop],
		on: (event, handler) => {
			document.addEventListener(event.key, (kernel_event) =>
				handler($, { payload: kernel_event.detail })
			);
		},
		watch: (handler) => {
			document.addEventListener(store_changed_event_key, () =>
				handler($)
			);
		},
		subscribe(prop) {},
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

$upper.on(app_launched, (store) => {
	store.upperCased = $regular.get("name")?.toUpperCase() ?? "";
});

$regular.on(name_changed, (store, event) => {
	store.name = event.payload ?? "";
	upper_case_needed.emit();
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

app_launched.emit();
// ----------------

const reactive_regular = $regular.__html__bind__subscribe(display, "name");
const reactive_upper = $upper.__html__bind__subscribe(upper, "upperCased");

input.addEventListener("input", ({ target }) => {
	name_changed.emit(target.value);
});

unsubscribe.addEventListener("click", () => {
	reactive_regular.unsubscribe();
	reactive_upper.unsubscribe();
});
