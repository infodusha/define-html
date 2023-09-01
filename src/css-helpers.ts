import {cloneNode} from './helpers.js';

const hostRe = /:host(\((.+)\))?/g;

export function getEncapsulatedCss(template: HTMLTemplateElement, style: HTMLStyleElement, selector: string): string {
    const unique = `data-${selector}-css`;
    if (!style.sheet) {
        return '';
    }
    const cssRules = Array.from(style.sheet.cssRules) as CSSStyleRule[];
    for (const rule of cssRules) {
        if (rule.selectorText.match(hostRe)) {
            rule.selectorText = rule.selectorText.replace(hostRe, `${selector}$2`);
            continue;
        }
        for (const element of template.content.querySelectorAll(rule.selectorText)) {
            element.setAttribute(unique, '');
        }
        rule.selectorText = `${rule.selectorText}[${unique}]`;
    }
    return cssRules.map((rule) => rule.cssText).join('\n');
}

export function appendCssLink(cssText: string): void {
    const url = URL.createObjectURL(new Blob([cssText], { type: 'text/css' }));
    const element = document.createElement('link');
    element.setAttribute('rel', 'stylesheet');
    element.setAttribute('type', 'text/css');
    element.href = url;
    document.head.appendChild(element);
    URL.revokeObjectURL(url);
}

export function applyGlobalStyles(styles: HTMLStyleElement[]): void {
    for (const style of styles) {
        const element = cloneNode(style);
        element.removeAttribute('data-global');
        document.head.appendChild(element);
    }
}
