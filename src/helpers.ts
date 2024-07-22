export const commentMarker = "__DEFINE_HTML__";

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

const ignoreDataAttribute = "data-define-html-ignore";
const selector = `link[rel='preload'][as='fetch'][href$='.html']:not([${ignoreDataAttribute}])`;

export function getComponentLinks(document: Document): HTMLLinkElement[] {
	return Array.from(document.querySelectorAll(selector));
}
