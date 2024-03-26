import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';

import { createEvent, createStore } from '~/core/src/core';
import { useStore } from '~/react/src/core';

describe('react bind', () => {
	const initial_value = 5;
	const incremented = createEvent();
	const $main = createStore({ counter: initial_value });
	$main.on(incremented, (store) => {
		store.counter += 1;
	});

	let render_times = 0;
	function App() {
		render_times += 1;
		const $ = useStore($main);
		return <p data-testid='content'>{$.counter}</p>;
	}
	function get_app_value() {
		return Number(screen.getByTestId('content').innerText);
	}

	beforeEach(() => {
		render_times = 0;
		render(<App />);
	});

	test('initial render', () => {
		expect(render_times).toEqual(1);
		expect(get_app_value()).toEqual(initial_value);
	});

	test('store mutation should trigger render once', () => {
		act(incremented);
		expect(render_times).toEqual(2);
		expect(get_app_value()).toEqual(initial_value + 1);
	});
});
