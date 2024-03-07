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
		 * replace with direct subscription
		 * */
		value: $,
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
		subscribe(target, prop) {
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

const nameChanged = createEvent();
const upperCaseNeeded = createEvent();
const appLaunched = createEvent();

const $regular = createStore({ name: "Alex" });
const $upper = createStore({ upperCased: "" });

$upper.on(appLaunched, (store) => {
	store.upperCased = $regular.value?.name.toUpperCase();
});

$regular.on(nameChanged, (store, event) => {
	store.name = event.payload ?? "";
	upperCaseNeeded.emit();
});
$upper.on(upperCaseNeeded, (store) => {
	store.upperCased = $regular.value.name?.toUpperCase() ?? "";
});

$regular.watch((store) => {
	console.log("$regular", store);
});
$upper.watch((store) => {
	console.log("$upper", store);
});

appLaunched.emit();

const reactive_regular = $regular.subscribe(display, "name");
const reactive_upper = $upper.subscribe(upper, "upperCased");

input.addEventListener("input", ({ target }) => {
	nameChanged.emit(target.value);
});

unsubscribe.addEventListener("click", () => {
	reactive_regular.unsubscribe();
	reactive_upper.unsubscribe();
});
