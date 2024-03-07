const display = document.querySelector("#display");
const toggle = document.querySelector("#log");

/*
 * add event store_key
 * */
const STORE_CHANGED = "store_changed";

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
	const $ = new Proxy(structuredClone(initial ?? {}), {
		get(target, prop) {
			return target[prop];
		},
		set(target, prop, val) {
			target[prop] = val;
			document.dispatchEvent(new Event(STORE_CHANGED));
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
			document.addEventListener(STORE_CHANGED, () => handler($));
		},
		subscribe(target, prop) {
			function updateTarget() {
				target.innerHTML = $[prop];
			}

			document.addEventListener(STORE_CHANGED, updateTarget);
			updateTarget();

			return {
				unsubscribe() {
					document.removeEventListener(STORE_CHANGED, updateTarget);
				},
			};
		},
	};
}

// ----------------------------

const connected = createEvent();
const disconnected = createEvent();
const nameChanged = createEvent();

const $reactive_store = createStore({ isConnected: false, name: "Alex" });

$reactive_store.on(connected, (store) => (store.isConnected = true));
$reactive_store.on(disconnected, (store) => (store.isConnected = false));

$reactive_store.on(nameChanged, (store, event) => {
	store.name = event.payload;
});

$reactive_store.watch((store) => {
	console.log(store.name);
});

const reactive_display = $reactive_store.subscribe(display, "name");
// setTimeout(() => reactive_display.unsubscribe(), 2000);

toggle.addEventListener("click", () => {
	nameChanged.emit("Nikita / " + Math.random());
});
