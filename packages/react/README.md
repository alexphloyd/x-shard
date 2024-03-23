# x-shard

<a href="https://github.com/arch1i/x-shard" target="_blank">GitHub</a>

React bindings for x-shard.
```plaintext
yarn add x-shard-react
```

#### Showcase
```ts
import { createEvent, createStore } from 'x-shard';
import { useStore } from 'x-shard-react';

const $main = createStore({ counter: 5 });
const incremented = createEvent();

$main.on(incremented, (store) => {
	store.counter += 1;
});
$main.on('document:DOMContentLoaded', (store) => {
	store.counter += 10;
});

function App() {
	const $ = useStore($main);

	return (
		<button onClick={() => incremented()}>count is {$.counter}</button>
	);
}

```

