declare type Brand<K, T> = K & { __brand: T };

declare type ResourcePath<T, D extends any[] = []> = T extends Array<any>
	? never
	: Values<{
			[K in Exclude<keyof T, symbol>]: `${K}${_ResourcePath<T[K], D>}`;
	  }>;

type Values<T extends object> = T[keyof T];
type _ResourcePath<T, D extends any[]> = D['length'] extends 15
	? ''
	: T extends object
	? '' | `.${ResourcePath<T, [...D, 0]>}`
	: '';
