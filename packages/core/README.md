# x-shard

<a href="https://github.com/arch1i/x-shard" target="_blank">GitHub</a>

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

// subsequence events batches in one process so .track will be triggered once
$auth.track((snapshot) => {
   /**
    * Intended for tracking and emitting events on desired changes.
    * Included into subsequent event handling process.
    * */

    const { logger, session } = snapshot;

    if (session?.is_verified) {
        logger?.stdout('session has been certificated');
        side_event();
    }
});

$auth.subscribe((snapshot) => {
    /**
    * runs a handler after the entire chain of event handlers is completed 
    * and the store has changed.
    * */
})

const session = get_session();
session_defined(session);

```




