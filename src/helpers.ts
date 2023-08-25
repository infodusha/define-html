// From https://github.com/antonkc/MOR/blob/main/matchJsImports.md
const importRe = /(?<=(?:[\s\n;])|^)(?:import[\s\n]*((?:(?<=[\s\n])type)?)(?=[\n\s\*\{])[\s\n]*)((?:(?:[_\$\w][_\$\w0-9]*)(?:[\s\n]+(?:as[\s\n]+(?:[_\$\w][_\$\w0-9]*)))?(?=(?:[\n\s]*,[\n\s]*[\{\*])|(?:[\n\s]+from)))?)[\s\n,]*((?:\*[\n\s]*(?:as[\s\n]+(?:[_\$\w][_\$\w0-9]*))(?=[\n\s]+from))?)[\s\n,]*((?:\{[n\s]*(?:(?:[_\$\w][_\$\w0-9]*)(?:[\s\n]+(?:as[\s\n]+(?:[_\$\w][_\$\w0-9]*)))?[\s\n]*,?[\s\n]*)*\}(?=[\n\s]*from))?)(?:[\s\n]*((?:from)?))[\s\n]*(?:["']([^"']*)(["']))[\s\n]*?;?/gm;

export function cloneNode<T extends Node>(element: T): T {
    return element.cloneNode(true) as T;
}

export function throwIfNotDefined<T>(value: T, nullText?: string): asserts value is NonNullable<T>  {
    if (!value) {
        throw new Error(nullText ?? 'Unexpected to get here');
    }
}

export function returnIfDefined<T>(value: T, nullText?: string): NonNullable<T> {
    throwIfNotDefined(value, nullText)
    return value;
}

declare global {
    interface Window {
        [definedElementsRegistrySymbol]: Map<string, Element>;
    }
}

const definedElementsRegistrySymbol: unique symbol = Symbol.for('definedElementsRegistrySymbol');
window[definedElementsRegistrySymbol] = new Map<string, Element>();

export function registerComponent(uuid: string, element: Element): void {
    window[definedElementsRegistrySymbol].set(uuid, element)
}

export function unregisterComponent(uuid: string): void {
    window[definedElementsRegistrySymbol].delete(uuid);
}

export function setThisForModuleScript(code: string, uuid: string): string {
    // TODO relative import path should also be replaced
    const imports = [...code.matchAll(importRe)].map((match) => match[0]).join('\n');

    return `
        ${imports}

        (function () {
            ${code.replaceAll(importRe, '')}
        }).call(window[Symbol.for('definedElementsRegistrySymbol')].get('${uuid}'))
    `.trim();
}
