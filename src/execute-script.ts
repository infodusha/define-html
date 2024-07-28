import { returnIfDefined } from "./helpers.js";

// From https://github.com/antonkc/MOR/blob/main/matchJsImports.md
const importRe =
	/(?<=(?:[\s\n;])|^)(?:import[\s\n]*((?:(?<=[\s\n])type)?)(?=[\n\s\*\{])[\s\n]*)((?:(?:[_\$\w][_\$\w0-9]*)(?:[\s\n]+(?:as[\s\n]+(?:[_\$\w][_\$\w0-9]*)))?(?=(?:[\n\s]*,[\n\s]*[\{\*])|(?:[\n\s]+from)))?)[\s\n,]*((?:\*[\n\s]*(?:as[\s\n]+(?:[_\$\w][_\$\w0-9]*))(?=[\n\s]+from))?)[\s\n,]*((?:\{[n\s]*(?:(?:[_\$\w][_\$\w0-9]*)(?:[\s\n]+(?:as[\s\n]+(?:[_\$\w][_\$\w0-9]*)))?[\s\n]*,?[\s\n]*)*\}(?=[\n\s]*from))?)(?:[\s\n]*((?:from)?))[\s\n]*(?:["']([^"']*)(["']))[\s\n]*?;?/gm;

const scriptContextSymbolKey = "define-html-script-context";
const scriptContextSymbol: unique symbol = Symbol.for(scriptContextSymbolKey);

declare global {
	interface Window {
		[scriptContextSymbol]: Map<string, Element>;
	}
}

export type CleanupFn = () => void;

window[scriptContextSymbol] = new Map<string, Element>();

async function getCode(
	element: HTMLScriptElement,
	relativeTo: string
): Promise<string> {
	const src = element.getAttribute("src");
	if (src) {
		const url = src.startsWith(".") ? changeRelativeUrl(src, relativeTo) : src;
		const res = await fetch(url);
		return res.text();
	}
	return element.innerText;
}

function changeRelativeUrl(href: string, relativeTo: string): string {
	const isRelativeRelative =
		!relativeTo.startsWith("http") && !relativeTo.startsWith("//");
	const absoluteRelativeTo = isRelativeRelative
		? changeRelativeUrl(relativeTo, document.location.href)
		: relativeTo;
	const url = new URL(href, absoluteRelativeTo);
	return url.href;
}

function changeImport(match: RegExpMatchArray, relativeTo: string): string {
	const href = returnIfDefined(match[6]);
	if (!href.startsWith(".")) {
		return match[0];
	}
	return match[0].replace(href, changeRelativeUrl(href, relativeTo));
}

function setContextForModuleScript(
	code: string,
	uuid: string,
	relativeTo: string
): string {
	const imports = [...code.matchAll(importRe)]
		.map((match) => changeImport(match, relativeTo))
		.join("\n");
	const component = `window[Symbol.for('${scriptContextSymbolKey}')].get('${uuid}')`;
	return `${imports}\n(function () {\n${code.replaceAll(
		importRe,
		""
	)}\n}).call(${component});`;
}

export async function executeScript(
	element: HTMLScriptElement,
	relativeTo: string,
	context: Element
): Promise<CleanupFn | undefined> {
	const code = await getCode(element, relativeTo);
	const uuid = crypto.randomUUID();
	window[scriptContextSymbol].set(uuid, context);
	const jsCode = setContextForModuleScript(code, uuid, relativeTo);
	const cleanup = () => window[scriptContextSymbol].delete(uuid);
	const url = URL.createObjectURL(
		new Blob([jsCode], { type: "text/javascript" })
	);
	await import(url);
	URL.revokeObjectURL(url);
	return cleanup;
}
