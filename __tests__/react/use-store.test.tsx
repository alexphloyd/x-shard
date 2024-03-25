import { describe, test } from 'vitest';
import { render, screen } from '@testing-library/react';

import { createEvent, createStore } from '~/core/src/core';
import { useStore } from '~/react/src/core';

describe('react bind', () => {
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

		return <p>{$.counter}</p>;
	}

	test('use-store', () => {
		render(<App />);

		screen.debug();
	});
});
