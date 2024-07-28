import { createComponent } from "./create-component.js";
import {
	commentMarker,
	componentSelector,
	returnIfDefined,
} from "./helpers.js";

const parser = new DOMParser();

type ComponentMeta = [string, string];

document.addEventListener("DOMContentLoaded", async () => {
	try {
		const components = await getComponents();
		for (const [text, href] of components) {
			const definedElement = parser.parseFromString(text, "text/html");
			customElements.define(...createComponent(definedElement, href));
		}
	} catch (err) {
		console.error(err);
	}
});

async function fetchFromLink(link: HTMLLinkElement): Promise<ComponentMeta> {
	const href = returnIfDefined(link.getAttribute("href"));
	const response = await fetch(href).catch((err) => {
		throw new Error(`Unable to load ${href}`, { cause: err });
	});
	const text = await response.text();
	return [text, href];
}

async function getComponents(): Promise<ComponentMeta[]> {
	const links = Array.from<HTMLLinkElement>(
		document.querySelectorAll(componentSelector)
	);
	const components = await Promise.all(links.map(fetchFromLink));
	components.push(...getFromComments());
	return components;
}

function getFromComments(): ComponentMeta[] {
	return Array.from(document.head.childNodes)
		.filter((node) => node.nodeType !== Node.COMMENT_NODE)
		.filter((node) => !node.textContent?.startsWith(commentMarker))
		.map((node) =>
			returnIfDefined(node.textContent)
				.replace(commentMarker, "")
				.split(/\n(.*)/s)
		)
		.map(([href, text]) => [returnIfDefined(text), returnIfDefined(href)]);
}
