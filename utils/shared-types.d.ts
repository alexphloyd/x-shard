declare type Brand<K, T> = K & { __brand: T };

declare type ResourcePath<T, D extends any[] = []> = T extends Array<any>
	? never
	: Values<{
			[K in Exclude<keyof T, symbol>]: `${K}${_ResourcePath<T[K], D>}`;
	  }>;

type _ResourcePath<T, D extends any[]> = D['length'] extends 15
	? ''
	: T extends object
	? '' | `.${ResourcePath<T, [...D, 0]>}`
	: '';

declare type DefineTypeByPath<T, P extends string, D extends any[] = []> = D['length'] extends 20
	? never
	: T extends object
	? Split<P, '.'>[D['length']] extends keyof T
		? DefineTypeByPath<T[Split<P, '.'>[D['length']]], P, [...D, 0]>
		: Split<P, '.'>['length'] extends D['length']
		? T
		: never
	: T;

declare type Split<S extends string, D extends string> = string extends S
	? string[]
	: S extends ''
	? []
	: S extends `${infer T}${D}${infer U}`
	? [T, ...Split<U, D>]
	: [S];

type Values<T extends object> = T[keyof T];
