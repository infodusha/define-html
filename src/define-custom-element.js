import {ErrorStackModifier} from './error-stack-modifier.js';

export function defineCustomElement(definedElement) {
    const template = definedElement.querySelector('template');
    const useShadow = template.hasAttribute('data-shadow');
    const selector = template.getAttribute('data-selector');
    const styles = definedElement.querySelectorAll('style:not([data-global])');
    const globalStyles = definedElement.querySelectorAll('style[data-global]');
    const scripts = definedElement.querySelectorAll('script');

    applyGlobalStyles(globalStyles);

    if(!useShadow) {
        setEmulatedStyles(styles, selector);
    }

    const usedAttributes = getUsedAttributes(template);

    class DefineHTMLElement extends HTMLElement {
        static get observedAttributes() {
            return usedAttributes;
        }

        constructor() {
            super();
            this.#attach();
            if (useShadow) {
                this.#setShadowStyles();
            }
            this.#setAttrs();
            this.#makeProperties();
            this.#execScripts();
        }

        attributeChangedCallback(name, oldValue, newValue) {
            this.#applyAttr(name, newValue);
        }

        #getContent() {
            const content = template.content.cloneNode(true);
            for (const element of content.querySelectorAll(`[data-if]`)) {
                const hasIfNot = element.hasAttribute('data-if-not');
                const name = element.getAttribute('data-if');
                const hasAttr = this.hasAttribute(name);
                if (hasIfNot ? hasAttr : !hasAttr) {
                    element.remove();
                }
            }
            return content;
        }

        #attach() {
            const content = this.#getContent();
            if (useShadow) {
                this.attachShadow({ mode: 'open' });
                this.shadowRoot.appendChild(content);
            } else {
                const slotElements = content.querySelectorAll('slot');
                if (slotElements.length === 0 && this.childNodes.length > 0) {
                    throw new Error(`No slot found for ${selector}`)
                }
                // TODO probably handle full slot support
                for (const element of slotElements) {
                    if (this.childNodes.length > 0) {
                        element.before(...this.childNodes);
                    }
                    element.remove();
                }
                this.appendChild(content);
            }
        }

        #applyAttr(name, value) {
            const root = useShadow ? this.shadowRoot : this;
            for (const element of root.querySelectorAll(`[data-attr='${name}']`)) {
                if (element.childNodes) {
                    // TODO handle case when there are already nodes inside
                }
                element.innerText = value;
            }
            // TODO add support for data-if and data-if-not when changed via js
        }

        #setShadowStyles() {
            for (const style of styles) {
                const element = style.cloneNode(true);
                this.shadowRoot.appendChild(element);
            }
        }

        #execScripts() {
            for (const script of scripts) {
                if (script.getAttribute('type') === 'module') {
                    // TODO Should module scripts be global?
                    const url = URL.createObjectURL(new Blob([script.innerText], { type: 'text/javascript' }));
                    import(url).then(() => URL.revokeObjectURL(url)).catch(console.error);
                } else {
                    // TODO How we can control if script is global or not?
                    const code = Function(script.innerText);
                    try {
                        code.call(this);
                    } catch (e) {
                        const stack = ErrorStackModifier.fromError(e);
                        const currentPlaceStackLength = ErrorStackModifier.current().items.length;
                        const cutSize = currentPlaceStackLength - 2;
                        const newStack = new ErrorStackModifier(stack.items.slice(0, -cutSize));
                        newStack.applyToRow((r) => r.replace('DefineHTMLElement.eval', selector));
                        console.error(newStack.toString());
                    }
                }
            }
        }

        #setAttrs() {
            for (const name of this.getAttributeNames()) {
                this.#applyAttr(name, this.getAttribute(name));
            }
        }

        #makeProperties() {
            for (const name of usedAttributes) {
                Object.defineProperty(this, name, {
                    get() {
                        return this.getAttribute(name);
                    },
                    set(newValue) {
                        this.setAttribute(name, newValue);
                    },
                    enumerable: true,
                    configurable: true,
                });
            }
        }
    }

    customElements.define(selector, DefineHTMLElement);
}

function appendCssLink(cssText) {
    const url = URL.createObjectURL(new Blob([cssText], { type: 'text/css' }));
    const element = document.createElement('link');
    element.setAttribute('rel', 'stylesheet');
    element.setAttribute('type', 'text/css');
    element.href = url;
    document.head.appendChild(element);
    URL.revokeObjectURL(url);
}

function setEmulatedStyles(styles, selector) {
    function getCssRuleText(rule) {
        rule.selectorText = rule.selectorText.replace(/:host\((.+)\)/g, `${selector}$1`);
        rule.selectorText = rule.selectorText.replace(/:host/g, selector);
        const re = new RegExp(`^(?!${selector})(.+?)\\s*`,'g');
        rule.selectorText = rule.selectorText.replace(re, `${selector} $1`);
        return rule.cssText;
    }

    for (const style of styles) {
        const cssText = Array.from(style.sheet.cssRules)
            .map(getCssRuleText)
            .join('\n');
        appendCssLink(cssText);
    }
}

function applyGlobalStyles(styles) {
    for (const style of styles) {
        const element = style.cloneNode(true);
        element.removeAttribute('data-global');
        document.head.appendChild(element);
    }
}

function getUsedAttributes(template) {
    const attrList = Array.from(template.content.querySelectorAll('[data-attr]'))
        .map((element) => element.getAttribute('data-attr'));
    const ifList = Array.from(template.content.querySelectorAll('[data-if]'))
        .map((element) => element.getAttribute('data-attr'));

    return [...attrList, ...ifList].filter((v, i, arr) => arr.indexOf(v) === i);
}
