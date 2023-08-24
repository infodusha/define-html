import {ErrorStackModifier} from './error-stack-modifier.js';


export function defineCustomElement(definedElement) {
    const template = definedElement.querySelector('template');
    const useShadow = template.hasAttribute('data-shadow');
    const selector = template.getAttribute('data-selector');
    const styles = definedElement.querySelectorAll('style');
    const scripts = definedElement.querySelectorAll('script');

    if(!useShadow) {
        setEmulatedStyles(styles, selector);
    }

    class DefineHTMLElement extends HTMLElement {
        #observedProperties = new Set();

        #attributeChangeObserver;

        constructor() {
            super();
            const onAttributeChange = this.#onAttributeChange.bind(this);
            this.#attributeChangeObserver = new MutationObserver(onAttributeChange);
            this.#attach();
            if (useShadow) {
                this.#setShadowStyles();
            }
            this.#observeAttributes();
            this.#execScripts();
        }

        connectedCallback() {
            this.#attributeChangeObserver.observe(this, { attributes: true });
        }

        disconnectedCallback() {
            this.#observedProperties.clear();
            this.#attributeChangeObserver.disconnect()
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
                    const url = URL.createObjectURL(new Blob([script.innerText], { type: 'text/javascript' }));
                    import(url).then(() => URL.revokeObjectURL(url)).catch(console.error);
                } else {
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

        #observeAttributes() {
            for (const name of this.getAttributeNames()) {
                this.#makeObservedProperty(name);
            }
        }

        #makeObservedProperty(name) {
            if (this.#observedProperties.has(name)) {
                return;
            }
            let value = this.getAttribute(name);
            this.#applyAttr(name, value);
            Object.defineProperty(this, name, {
                get() {
                    return value;
                },
                set(newValue) {
                    value = newValue;
                    this.#applyAttr(name, newValue);
                },
                enumerable: true,
                configurable: true,
            });
            this.#observedProperties.add(name);
        }

        #onAttributeChange(mutationList) {
            for (const mutation of mutationList) {
                if (mutation.type !== 'attributes') {
                    throw new Error('Unexpected');
                }
                const { attributeName } = mutation;
                if (this.#observedProperties.has(attributeName)) {
                    this[attributeName] = this.getAttribute(attributeName);
                } else {
                    this.#makeObservedProperty(attributeName);
                }
            }
        }
    }

    customElements.define(selector, DefineHTMLElement);
}

function setEmulatedStyles(styles, selector) {
    for (const style of styles) {
        const cssRules = [];

        for (const rule of style.sheet.cssRules) {
            rule.selectorText = rule.selectorText.replace(/:host\((.+)\)/g, `${selector}$1`);
            rule.selectorText = rule.selectorText.replace(/:host/g, selector);
            const re = new RegExp(`^(?!${selector})(.+?)\\s*`,'g');
            rule.selectorText = rule.selectorText.replace(re, `${selector} $1`);
            cssRules.push(rule);
        }

        const cssText = cssRules.map((rule) => rule.cssText).join('\n');
        const url = URL.createObjectURL(new Blob([cssText], { type: 'text/css' }));
        const element = document.createElement('link');
        element.setAttribute('rel', 'stylesheet');
        element.setAttribute('type', 'text/css');
        element.href = url;
        document.head.appendChild(element);
        URL.revokeObjectURL(url);
    }
}
