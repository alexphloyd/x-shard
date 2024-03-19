import { ProxyTarget } from './core';

export const mutated_proxies_map = new WeakMap<ProxyTarget, boolean>();

export const browser_event_target_map = {
	window,
	document,
};
