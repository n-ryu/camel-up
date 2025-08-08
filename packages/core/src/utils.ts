export const shuffle = <T>(array: T[]): T[] =>
	array
		.map((value) => ({ value, random: Math.random() }))
		.toSorted((a, b) => a.random - b.random)
		.map(({ value }) => value);
