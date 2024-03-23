# x-shard

<a href="https://www.npmjs.com/package/x-shard" target="_blank">npm</a>

Event-driven tool to describe behavior rely on either domain or browser events.
```plaintext
yarn add x-shard
```
x-shard is framework-agnostic tool operates within web environment following its Standards. <br />
web-framework bindings will be published soon.

#### Showcase
```ts
const $auth = createStore<{ session?: Session; logger?: Logger }>();
const $side = createStore({ wallet: 'data' });

const session_defined = createEvent<Session>();
const uncertified_coins_defined = createEvent<Session['id']>();

$auth.on('window:offline' , () => { /* do something */ })

$auth.on(session_defined, (store, payload) => {
    store.session = wrap(payload, $side.get().wallet);
    store.logger = new Logger();

    uncertified_coins_defined(store.session?.id);
});

$auth.on(uncertified_coins_defined, (store, payload) => {
    const session_with_certificated_coins = certificate(payload);

    store.session = session_with_certificated_coins;
});

// subsequence events batches in one process so .track will be triggered once
$auth.track((snapshot) => {
    const { logger, session } = snapshot;

    if (session?.is_verified) {
        logger?.stdout('session has been certificated');
    }
});

const session = get_session();
session_defined(session);

```

