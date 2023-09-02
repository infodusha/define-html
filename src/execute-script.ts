import {ErrorStackModifier} from "./error-stack-modifier.js";
import {returnIfDefined} from "./helpers.js";

// From https://github.com/antonkc/MOR/blob/main/matchJsImports.md
const importRe = /(?<=(?:[\s\n;])|^)(?:import[\s\n]*((?:(?<=[\s\n])type)?)(?=[\n\s\*\{])[\s\n]*)((?:(?:[_\$\w][_\$\w0-9]*)(?:[\s\n]+(?:as[\s\n]+(?:[_\$\w][_\$\w0-9]*)))?(?=(?:[\n\s]*,[\n\s]*[\{\*])|(?:[\n\s]+from)))?)[\s\n,]*((?:\*[\n\s]*(?:as[\s\n]+(?:[_\$\w][_\$\w0-9]*))(?=[\n\s]+from))?)[\s\n,]*((?:\{[n\s]*(?:(?:[_\$\w][_\$\w0-9]*)(?:[\s\n]+(?:as[\s\n]+(?:[_\$\w][_\$\w0-9]*)))?[\s\n]*,?[\s\n]*)*\}(?=[\n\s]*from))?)(?:[\s\n]*((?:from)?))[\s\n]*(?:["']([^"']*)(["']))[\s\n]*?;?/gm;

declare global {
    interface Window {
        [scriptContextSymbol]: Map<string, Element>;
    }
}

export type CleanupFn = () => void;

const scriptContextSymbolKey = 'scriptContextSymbol';
const scriptContextSymbol: unique symbol = Symbol.for(scriptContextSymbolKey);
window[scriptContextSymbol] = new Map<string, Element>();

async function getCode(element: HTMLScriptElement, relativeTo: string): Promise<string> {
    const src = element.getAttribute('src');
    if (src) {
        const url = src.startsWith('.') ? changeRelativeUrl(src, relativeTo) : src;
        const res = await fetch(url)
        return res.text();
    } else {
        return element.innerText;
    }
}

function changeRelativeUrl(href: string, relativeTo: string): string {
    const isRelativeRelative = !relativeTo.startsWith('http') && !relativeTo.startsWith('//');
    const absoluteRelativeTo = isRelativeRelative ? changeRelativeUrl(relativeTo, document.location.href) : relativeTo;
    const url = new URL(href, absoluteRelativeTo);
    return url.href;
}

function changeImport(match: RegExpMatchArray, relativeTo: string): string {
    const href = returnIfDefined(match[6]);
    if (!href.startsWith('.')) {
        return match[0];
    }
    return match[0].replace(href, changeRelativeUrl(href, relativeTo));
}

function setContextForModuleScript(code: string, uuid: string, relativeTo: string): string {
    const imports = [...code.matchAll(importRe)].map((match) => changeImport(match, relativeTo)).join('\n');
    const component = `window[Symbol.for('${scriptContextSymbolKey}')].get('${uuid}')`;
    return `${imports}\n(function () {\n${code.replaceAll(importRe, '')}\n}).call(${component});`
}

async function executeModule(code: string, relativeTo: string, context?: Element): Promise<CleanupFn | void> {
    let cleanup: CleanupFn | undefined = undefined;
    if (context) {
        const uuid = crypto.randomUUID();
        window[scriptContextSymbol].set(uuid, context);
        code = setContextForModuleScript(code, uuid, relativeTo);
        cleanup = () => window[scriptContextSymbol].delete(uuid);
    }
    const url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
    await import(url);
    URL.revokeObjectURL(url);
    return cleanup;
}

function execute(code: string, context?: Element): CleanupFn | void {
    const fn = Function(code);
    try {
        const result = fn.call(context);
        return typeof result === 'function' ? result : undefined;
    } catch (e) {
        if (e instanceof Error) {
            const stack = ErrorStackModifier.fromError(e);
            const currentPlaceStackLength = ErrorStackModifier.current().items.length;
            const cutSize = currentPlaceStackLength - 2;
            const newStack = new ErrorStackModifier(stack.items.slice(0, -cutSize));
            const selector = context?.tagName.toLowerCase();
            if (selector) {
                newStack.applyToRow((r) => r.replace('Component.eval', selector));
            }
            console.error(newStack.toString());
        } else {
            console.error(e);
        }
    }
}


export async function executeScript(element: HTMLScriptElement, relativeTo: string): Promise<void>;
export async function executeScript(element: HTMLScriptElement, relativeTo: string, context: Element): Promise<CleanupFn>;
export async function executeScript(element: HTMLScriptElement, relativeTo: string, context?: Element): Promise<CleanupFn | void> {
    const code = await getCode(element, relativeTo);
    const isModule = element.getAttribute('type') === 'module';
    if (isModule) {
        return await executeModule(code, relativeTo, context);
    }
    return execute(code, context);
}