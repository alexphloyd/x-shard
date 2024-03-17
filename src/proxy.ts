import { ProxyTarget, mutated_proxies_map } from './core';
import { is_object } from './parse-object';

export function create_deep_writable_proxy<T extends ProxyTarget>(proxy_target: T, deep?: unknown): T {
	const current_target = deep != null ? deep : proxy_target;
	return new Proxy(current_target, {
		get(target: any, prop: any) {
			return is_object(target[prop])
				? create_deep_writable_proxy(proxy_target, target[prop])
				: target[prop as keyof typeof target];
		},
		set(target: any, prop: any, passed_value: unknown) {
			const value = is_object(passed_value)
				? create_deep_writable_proxy(proxy_target, passed_value)
				: passed_value;

			target[prop] = value;
			mutated_proxies_map.set(proxy_target, true);

			return true;
		},
	}) as T;
}

export function create_deep_immutable_proxy<T>(target: T): Readonly<T> {
	if (!is_object(target)) {
		return target;
	} else {
		return new Proxy(target as any, {
			get(target, prop) {
				return create_deep_immutable_proxy(target[prop]);
			},
			set() {
				throw new Error('Snapshot is immutable.');
			},
			deleteProperty() {
				throw new Error('Snapshot is immutable.');
			},
			setPrototypeOf() {
				throw new Error('Snapshot is immutable.');
			},
		});
	}
}
