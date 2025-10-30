declare global
{
	interface Map<K, V>
	{
		find<S extends V>(predicate: (value: V, key: K, map: Map<K, V>) => value is S, thisArg?: any): S | undefined;
		find(this: Map<K, V>, predicate: (value: V, key: K, map: Map<K, V>) => unknown, thisArg?: any): V | undefined;

		findKey<S extends K>(predicate: (key: K, value: V, map: Map<K, V>) => key is S, thisArg?: any): S | undefined;
		findKey(this: Map<K, V>, predicate: (key: K, value: V, map: Map<K, V>) => unknown, thisArg?: any): V | undefined;

		filter<S extends V>(predicate: (value: V, key: K, map: Map<K, V>) => value is S, thisArg?: any): Map<K, S>;
		filter(predicate: (value: V, key: K, map: Map<K, V>) => unknown, thisArg?: any): Map<K, V>;

		map<U>(callbackfn: (value: V, key: K, map: Map<K, V>) => U, thisArg?: any): Map<K, U>;

		mapArray<U>(callbackfn: (value: V, key: K, map: Map<K, V>) => U, thisArg?: any): U[];

		array<S = V>(): S[];
		arrayKeys(): K[];
	}
}

export type Prefix<Prefix extends string, T> =
{
	[K in keyof T as `${Prefix}${string & K}`]: T[K];
};

export type AddParameters<TFunction extends (...args: any) => any, TParameters extends [...args: any]> = (
	...args: [...TParameters, ...Parameters<TFunction>]
) => ReturnType<TFunction>;

export type ParentEvent<Prefix extends string, TParameters extends [...args: any], Parent> =
{
	[K in keyof Parent as `${Prefix}${string & K}`]: AddParameters<Parent[K], TParameters>;
}

type Public<T> =
{
	[P in keyof T]: T[P]
}

declare module "bezier-js" {
    interface utils {
        roots(points: Point[], line?: Line): number[];
    }
}
