# x-shard

<a href="https://www.npmjs.com/package/x-shard" target="_blank">npm</a>

An event-driven tool to describe behavior relies on either domain or browser events. x-shard is a framework-agnostic tool that operates within the web environment, adhering to its standards. <br />

```plaintext
yarn add x-shard
```

```ts
const $auth = createStore<{ session?: Session; logger?: Logger }>();

const session_defined = createEvent<Session>();

$auth.on('window:offline' , () => { /* do something */ })

$auth.on(session_defined, (store, payload) => {
    store.session = wrap(payload, $another_store.get().wallet);
    store.logger = new Logger();

    another_event(store.session?.id);
});

// subsequence events batches in one process so .track will be triggered once
$auth.track((snapshot) => {
    snapshot.logger?.stdout('session has been certificated');
});

session_defined(session); // emit domain event
```

#### React Bind
```plaintext
yarn add x-shard-react
```

```ts
const $main = createStore({ counter: 5, init: false });
const incremented = createEvent();

$main.on(incremented, (store) => {
    store.counter += 1;
});
$main.on('document:DOMContentLoaded', (store) => {
    store.counter += 10;
    store.init = true
});

function App() {
    const $counter = useStore($main, 'counter');
    return (
        <button onClick={() => incremented()}>{$counter}</button>
    )
}
```


