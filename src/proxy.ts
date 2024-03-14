import { ProxyTarget, scheduler } from './core';
import { is_object } from './parse-object';

export function create_writable_proxy<T extends ProxyTarget>(proxy_target: T, deep?: unknown) {
	if (deep) {
		return new Proxy(deep, {
			get(target, prop) {
				return is_object(target[prop])
					? create_writable_proxy(proxy_target, target[prop])
					: target[prop];
			},
			set(target, prop, passed_value) {
				const value = is_object(passed_value)
					? create_writable_proxy(proxy_target, passed_value)
					: passed_value;
				scheduler.post_job(proxy_target, () => (target[prop as keyof T] = value));
				return true;
			},
		});
	} else {
		return new Proxy(proxy_target, {
			get(target, prop) {
				return is_object(target[prop])
					? create_writable_proxy(proxy_target, target[prop])
					: target[prop];
			},
			set(target, prop, passed_value) {
				const value = is_object(passed_value)
					? create_writable_proxy(proxy_target, passed_value)
					: passed_value;
				scheduler.post_job(proxy_target, () => (target[prop as keyof T] = value));
				return true;
			},
		}) as T;
	}
}

// export function create_deep_writable_proxy<T extends ProxyTarget>(target: T): T {
// 	const stack = [{ target }];

// 	while (stack.length > 0) {
// 		const { target } = stack.pop()!;

// 		for (const key in target) {
// 			if (is_object(target[key])) {
// 				stack.push({ target: target[key] });
// 				target[key] = create_writable_proxy(target[key]);
// 			}
// 		}
// 	}

// 	return create_writable_proxy(target) as T;
// }

export function create_immutable_proxy<T extends object>(target: T): T {
	return new Proxy(target as Readonly<T>, {
		get(target, prop) {
			return target[prop as keyof typeof target];
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

export function create_deep_immutable_proxy<T extends ProxyTarget>(target: T) {
	const stack = [{ target }];

	while (stack.length > 0) {
		const { target } = stack.pop()!;

		for (const key in target) {
			if (is_object(target[key])) {
				stack.push({ target: target[key] });
				target[key] = create_immutable_proxy(target[key]);
			}
		}
	}

	return create_immutable_proxy(target) as Readonly<T>;
}
