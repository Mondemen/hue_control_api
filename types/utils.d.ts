// export type ParentEvent<Prefix extends string, TParameters extends [...args: any], Parent> =
// {
// 	[K in keyof Parent as `${Prefix}${string & K}`]: AddParameters<Parent[K], TParameters>;
// }

export type PartialDeep<B extends object | undefined> = Partial<{
	[P in keyof B]:
		(B[P] extends object[] | undefined ? PartialDeep<NonNullable<B[P]>[number]>[] :
			(B[P] extends object | undefined ? PartialDeep<NonNullable<B[P]>> : B[P])
		)
}>
