#!/usr/bin/env node

import fg from "fast-glob";
import {
	Browser,
	Window,
	HTMLTemplateElement,
	DocumentFragment,
	Document,
} from "happy-dom";

import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, relative, resolve, basename } from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";

import {
	componentSelector,
	returnIfDefined,
	throwIfNotDefined,
} from "./helpers";

const RUNTIME_FILE = "define-html.js";

const options = {
	outdir: {
		type: "string",
		short: "o",
		default: "./dist",
	},
	remote: {
		type: "boolean",
		short: "r",
		default: false,
	},
} as const;

const { values } = parseArgs({ args: process.argv.slice(2), options });

const COPY_RUNTIME = !returnIfDefined(values.remote);
const DIST_DIR = returnIfDefined(values.outdir);

const files = await fg("**/*.html", {
	ignore: ["**/node_modules/**", `${DIST_DIR}/**`],
});

const components = new Map<string, HTMLTemplateElement>();
const pages = new Set<string>();

for (const path of files) {
	const text = await readFile(path, "utf8");
	const browser = new Browser();
	const page = browser.newPage();
	page.content = text;
	const document = page.mainFrame.document;

	const links = document.querySelectorAll(componentSelector);
	if (links.length === 0) {
		if (!components.has(path)) {
			pages.add(path);
		}
		continue;
	}

	console.log(`${path} has ${links.length} components`);

	for (const link of links) {
		const component = relative(dirname(path), link.getAttribute("href"));
		const text = await readFile(component, "utf8");
		const window = new Window();
		const doc = window.document;
		doc.body.innerHTML = text;
		const template = doc.body.querySelector("template");
		throwIfNotDefined(template, "<template> is required");
		const style = doc.body.querySelector("style");
		const script = doc.body.querySelector("script");
		template.setAttribute("shadowrootmode", "open");
		if (style) {
			template.prepend(style);
		}
		if (script) {
			template.append(script);
		}
		link.remove();
		pages.delete(component);
		components.set(component, template);
	}

	function fillDocument(doc: DocumentFragment | Document) {
		for (const [component, template] of components) {
			const selector = basename(component).replace(".html", "");
			doc.querySelectorAll(selector).forEach((el) => {
				fillDocument(template.content);
				el.prepend(template.cloneNode(true));
			});
		}
	}

	fillDocument(document);

	if (COPY_RUNTIME) {
		const runtime_path = relative(dirname(path), RUNTIME_FILE);
		document
			.querySelector(`script[src$='define-html']`)!
			.setAttribute("src", runtime_path);
	}

	const out = await prepareSave(path);
	await writeFile(out, page.content);
}

for (const page of pages) {
	const out = await prepareSave(page);
	await copyFile(page, out);
	console.log(`${page} has 0 components`);
}

const assets = await fg("**/*", {
	ignore: ["**/*.html", "**/node_modules/**", `${DIST_DIR}/**`],
});

for (const asset of assets) {
	const out = await prepareSave(asset);
	await copyFile(asset, out);
}

if (COPY_RUNTIME) {
	const main = resolve(dirname(fileURLToPath(import.meta.url)), "index.js");
	await copyFile(main, resolve(DIST_DIR, RUNTIME_FILE));
	console.log("Runtime copied");
}

console.log("Done");

async function prepareSave(path: string) {
	const out = resolve(DIST_DIR, path);
	await mkdir(dirname(out), { recursive: true });
	return out;
}
