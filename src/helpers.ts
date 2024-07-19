export function cloneNode<T extends Node>(element: T): T {
	return element.cloneNode(true) as T;
}

export function throwIfNotDefined<T>(
	value: T,
	nullText?: string
): asserts value is NonNullable<T> {
	if (value === null || value === undefined) {
		throw new Error(nullText ?? "Unexpected to get here");
	}
}

export function returnIfDefined<T>(
	value: T,
	nullText?: string
): NonNullable<T> {
	throwIfNotDefined(value, nullText);
	return value;
}
