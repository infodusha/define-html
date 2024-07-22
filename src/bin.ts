#!/usr/bin/env node

import fg from "fast-glob";
import * as cheerio from "cheerio";

import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";

import { commentMarker, componentSelector, returnIfDefined } from "./helpers";

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

const components = new Set<string>();
const pages = new Set<string>();

for (const path of files) {
	const text = await readFile(path, "utf8");
	const $ = cheerio.load(text);

	const links = $(componentSelector);
	if (links.length === 0) {
		if (!components.has(path)) {
			pages.add(path);
		}
		continue;
	}

	console.log(`${path} has ${links.length} components`);

	for (const link of links) {
		const component = relative(dirname(path), link.attribs.href);
		components.add(component);
		pages.delete(component);
		const text = await readFile(component, "utf8");
		$(`<!--${commentMarker}${component}\n${text}-->`).insertBefore(link);
	}

	$(componentSelector).remove();

	if (COPY_RUNTIME) {
		const runtime_path = relative(dirname(path), RUNTIME_FILE);
		$(`script[src$='define-html']`).attr("src", runtime_path);
	}

	const out = await prepareSave(path);
	await writeFile(out, $.html());
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
