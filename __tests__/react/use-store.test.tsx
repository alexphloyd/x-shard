import { beforeEach, describe, expect, test } from 'vitest';
import { act, render, screen } from '@testing-library/react';

import { createEvent, createStore } from '~/core/src/core';
import { useStore } from '~/react/src/core';

describe('react bind', () => {
	const initial_value = 5;

	const incremented = createEvent();
	const no_side_effect = createEvent();
	const multiplied = createEvent();
	const reset = createEvent();

	const $main = createStore({ counter: initial_value });
	$main.on(multiplied, (store) => {
		store.counter += 1;
		store.counter += 1;
		store.counter += 1;
	});
	$main.on(incremented, (store) => {
		store.counter += 1;
	});
	$main.on(no_side_effect, (store) => {
		const prev = store.counter;
		store.counter = prev;
	});
	$main.on(reset, (store) => {
		store.counter = initial_value;
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
		reset();
		render_times = 0;
		render(<App />);
	});

	test('initial render', () => {
		expect(render_times).toEqual(1);
		expect(get_app_value()).toEqual(initial_value);
	});

	test('no side-effect events do not trigger render', () => {
		act(no_side_effect);
		expect(render_times).toEqual(1);
		expect(get_app_value()).toEqual(initial_value);
	});

	test('store mutation should trigger render once', () => {
		act(incremented);
		expect(render_times).toEqual(2);
		expect(get_app_value()).toEqual(initial_value + 1);
	});

	test('multiple mutations should trigger render once', () => {
		act(multiplied);
		expect(render_times).toEqual(2);
		expect(get_app_value()).toEqual(initial_value + 3);
	});
});
