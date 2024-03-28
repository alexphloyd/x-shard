import { beforeEach, describe, expect, test } from 'vitest';
import { act, render, screen } from '@testing-library/react';

import { createEvent, createStore } from '~/core/src/core';
import { useStore } from '~/react/src/core';

describe('react bind - partial', () => {
	const initial_counter_value = 5;
	const initial_side_value = 50;

	const incremented_counter = createEvent();
	const incremented_side = createEvent();
	const multiplied_side = createEvent();

	const no_side_effect = createEvent();
	const reset_store = createEvent();
	const side_changed = createEvent();

	const $main = createStore({ counter: initial_counter_value, side: { a: initial_side_value } });

	$main.on(multiplied_side, (store) => {
		store.side.a += 1;
		store.side.a += 1;
		store.side.a += 1;
	});
	$main.on(incremented_counter, (store) => {
		store.counter += 1;
	});
	$main.on(incremented_side, (store) => {
		store.side.a += 1;
	});
	$main.on(no_side_effect, (store) => {
		const prev_c = store.counter;
		const prev_side = store.side.a;
		store.counter = prev_c;
		store.side.a = prev_side;
	});
	$main.on(reset_store, (store) => {
		store.counter = initial_counter_value;
		store.side.a = initial_side_value;
	});
	$main.on(side_changed, (store) => {
		store.side.a *= 2;
	});

	let render_times = 0;
	function App() {
		const $ = useStore($main, 'side.a');
		render_times += 1;
		console.log($);
		return <p data-testid='content'>{$}</p>;
	}
	function get_app_side_value() {
		return Number(screen.getByTestId('content').innerText);
	}

	beforeEach(() => {
		reset_store();
		render_times = 0;
		render(<App />);
	});

	test('initial render', () => {
		expect(render_times).toEqual(1);
		expect(get_app_side_value()).toEqual(initial_side_value);
		expect($main.get().side.a).toEqual(get_app_side_value());
		expect($main.get().counter).toEqual(initial_counter_value);
	});

	test('no side-effect events do not trigger render', () => {
		act(no_side_effect);
		expect(render_times).toEqual(1);
		expect(get_app_side_value()).toEqual(initial_side_value);
	});

	test('not related mutation should not re-render app', () => {
		act(incremented_counter);
		expect(render_times).toEqual(2);
		expect(get_app_side_value()).toEqual(initial_side_value);
		expect($main.get().counter).toEqual(initial_counter_value + 1);
	});

	test('multiple mutations should trigger render once', () => {
		act(multiplied_side);
		expect(render_times).toEqual(2);
		expect(get_app_side_value()).toEqual(initial_side_value + 3);
	});

	test('single mutation should trigger render once', () => {
		act(incremented_side);
		expect(render_times).toEqual(2);
		expect(get_app_side_value()).toEqual(initial_side_value + 1);
	});

	test('two mutations should trigger render twice', () => {
		act(incremented_side);
		act(incremented_side);
		expect(render_times).toEqual(3);
		expect(get_app_side_value()).toEqual(initial_side_value + 2);
	});
});
