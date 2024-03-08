import { describe, test } from 'vitest';
import { createEvent, createStore } from '../src/core';
import { expect } from 'vitest';

describe('cloned initial', () => {
	const helper_event = createEvent();

	test('should not mutate origin Map', () => {
		const map_ref = new Map();
		map_ref.set('ok', 'google');

		const $ = createStore({ map_instance: map_ref });
		$.get('map_instance').set('hello', 'world');

		$.on(helper_event, (store) => {
			const init_map_value_in_store = store.map_instance.get('ok');
			const value_passed_by_store = store.map_instance.get('hello');

			expect(init_map_value_in_store).toBeDefined();
			expect(value_passed_by_store).toBeDefined();
		});

		const passed_value_in_origin_map = map_ref.get('hello');
		expect(passed_value_in_origin_map).toBeUndefined();

		helper_event();
	});
});
