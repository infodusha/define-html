import { cloneNode } from "./helpers.js";

export function createCssLink(cssText: string) {
	const url = URL.createObjectURL(new Blob([cssText], { type: "text/css" }));
	const element = document.createElement("link");
	element.setAttribute("rel", "stylesheet");
	element.setAttribute("type", "text/css");
	element.href = url;
	URL.revokeObjectURL(url);
	return element;
}

export type GlobalStyle = HTMLStyleElement | HTMLLinkElement;

export function getGlobalStyles(): GlobalStyle[] {
	return Array.from(
		document.querySelectorAll<GlobalStyle>("style, link[rel='stylesheet']")
	).map((el) => cloneNode(el));
}
