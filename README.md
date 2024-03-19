# x-shard

Event-driven tool to describe behavior rely on either domain or browser events

```ts
const $auth = createStore<{ session?: Session; logger?: Logger }>();
const $side = createStore({ wallet: 'data' });

const session_defined = createEvent<Session>();
const uncertified_coins_defined = createEvent<Session['id']>();

$auth.on(session_defined, (store, payload) => {
    store.session = wrap(payload, $side.get().wallet);
    store.logger = new Logger();

    // store updates in place, so you have an access to the store updated value
    if (!store.session?.is_verified) {
        uncertified_coins_defined(payload.id);
    }
});

$auth.on(uncertified_coins_defined, (store, payload) => {
    const session_with_certificated_coins = certificate(payload);

    if (session_with_certificated_coins.is_verified) {
        store.session = session_with_certificated_coins;
    }
});

$auth.on('window:offline' , () => { /* do something */ })

// subsequence events batches in one process so .watch will be triggered once
$auth.watch((snapshot) => {
    const { logger, session } = snapshot;

    if (session?.is_verified) {
        logger?.stdout('session has been certificated');
    }
});

const session = get_session();
session_defined(session);

```

