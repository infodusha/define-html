function processCssRule(rule, selector) {
    rule.selectorText = rule.selectorText.replace(/:host\((.+)\)/g, `${selector}$1`);
    rule.selectorText = rule.selectorText.replace(/:host/g, selector);
    const re = new RegExp(`^(?!${selector})(.+?)\\s*`,'g');
    rule.selectorText = rule.selectorText.replace(re, `${selector} $1`);
    return rule;
}

export function getCssRules(style, selector) {
    return Array.from(style.sheet.cssRules).map((rule) => processCssRule(rule, selector));
}

export function appendCssLink(cssText) {
    const url = URL.createObjectURL(new Blob([cssText], { type: 'text/css' }));
    const element = document.createElement('link');
    element.setAttribute('rel', 'stylesheet');
    element.setAttribute('type', 'text/css');
    element.href = url;
    document.head.appendChild(element);
    URL.revokeObjectURL(url);
}

export function applyGlobalStyles(styles) {
    for (const style of styles) {
        const element = style.cloneNode(true);
        element.removeAttribute('data-global');
        document.head.appendChild(element);
    }
}
