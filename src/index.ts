import { createComponent } from "./create-component.js";
import {
	commentMarker,
	getComponentLinks,
	returnIfDefined,
} from "./helpers.js";

const parser = new DOMParser();

document.addEventListener("DOMContentLoaded", () => {
	fetchFromLinks().catch(console.error);
	getFromComments();
});

async function fetchFromLinks(): Promise<void> {
	await Promise.all(getComponentLinks(document).map(defineHtml));
}

async function defineHtml(link: HTMLLinkElement): Promise<void> {
	const href = returnIfDefined(link.getAttribute("href"));
	const response = await fetch(href);
	const text = await response.text();
	const definedElement = parser.parseFromString(text, "text/html");
	customElements.define(...createComponent(definedElement, href));
}

function getFromComments() {
	for (const node of document.head.childNodes) {
		if (node.nodeType !== Node.COMMENT_NODE) {
			continue;
		}
		if (!node.textContent?.startsWith(commentMarker)) {
			continue;
		}
		const [href, text] = node.textContent
			.replace(commentMarker, "")
			.split(/\n(.*)/s);
		if (!text || !href) {
			continue;
		}

		const definedElement = parser.parseFromString(text, "text/html");
		customElements.define(...createComponent(definedElement, href));
	}
}
