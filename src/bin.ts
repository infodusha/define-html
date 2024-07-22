import fg from "fast-glob";
import { JSDOM } from "jsdom";

import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";

import { commentMarker, getComponentLinks } from "./helpers";

// TODO get from args
const DIST_DIR = "./dist";

const files = await fg("**/*.html", {
	ignore: ["**/node_modules/**", `${DIST_DIR}/**`],
});

const components = new Set<string>();
const pages = new Set<string>();

for (const path of files) {
	const text = await readFile(path, "utf8");
	const dom = new JSDOM(text);

	const links = getComponentLinks(dom.window.document);
	if (links.length === 0) {
		if (!components.has(path)) {
			pages.add(path);
		}
		continue;
	}

	console.log(`${path} has ${links.length} components`);

	for (const link of links) {
		const component = relative(dirname(path), link.href);
		components.add(component);
		pages.delete(component);
		const text = await readFile(component, "utf8");
		const comment = dom.window.document.createComment(
			`${commentMarker}${component}\n${text}`
		);
		link.before(comment);
		link.remove();
	}

	const out = await prepareSave(path);
	await writeFile(out, dom.serialize());
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

console.log("Done");

async function prepareSave(path: string) {
	const out = resolve(DIST_DIR, path);
	await mkdir(dirname(out), { recursive: true });
	return out;
}
