import {ErrorStackModifier} from './error-stack-modifier.js';
import {appendCssLink, applyGlobalStyles, getEncapsulatedCss} from './css-helpers.js';
import {
    changeRelativeUrl,
    cloneNode,
    registerComponent,
    returnIfDefined,
    setThisForModuleScript,
    throwIfNotDefined,
    unregisterComponent
} from './helpers.js';

interface AttributeChanged {
    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void;
}

interface Connected {
    connectedCallback(): void;
}

interface Disconnected {
    disconnectedCallback(): void;
}

export function createComponent(definedElement: Document, href: string): [string, typeof HTMLElement] {
    const template = returnIfDefined(definedElement.querySelector('template'), 'Template is required');
    const selector = returnIfDefined(template.getAttribute('data-selector'), 'Selector is required');
    const useShadow = template.hasAttribute('data-shadow');

    const styles: NodeListOf<HTMLStyleElement> = definedElement.querySelectorAll('style:not([data-global])');
    const scripts = definedElement.querySelectorAll('script');

    const globalStyles: NodeListOf<HTMLStyleElement> = definedElement.querySelectorAll('style[data-global]');
    applyGlobalStyles(Array.from(globalStyles));

    if(!useShadow) {
        for (const style of styles) {
            const cssText = getEncapsulatedCss(template, style, selector)
            appendCssLink(cssText);
        }
    }

    const usedAttributes = getUsedAttributes(template, ['data-attr', 'data-if']);

    class Component extends HTMLElement implements AttributeChanged, Connected, Disconnected {
        static get observedAttributes(): string[] {
            return usedAttributes;
        }

        readonly #attrElements: HTMLElement[] = [];
        readonly #attrDefaults = new WeakMap<HTMLElement, ChildNode[]>();
        readonly #optionalElements: Element[] = [];

        readonly #uuid = crypto.randomUUID();

        constructor() {
            super();
            const content = cloneNode(template.content);
            this.#attrElements = Array.from(content.querySelectorAll(`[data-attr]`))
            this.#optionalElements = Array.from(content.querySelectorAll(`[data-if]`));
            this.#initOptionality();
            this.#attach(content);
            this.#setAttrs();
            this.#makeProperties();
            this.#execScripts();
        }

        connectedCallback(): void {
            registerComponent(this.#uuid, this);
        }

        disconnectedCallback(): void {
            unregisterComponent(this.#uuid);
        }

        attributeChangedCallback(name: string, _oldValue: unknown, newValue: string | null): void {
            this.#applyAttr(name, newValue);
            this.#applyOptionality(name);
        }

        #initOptionality(): void {
            for (const element of this.#optionalElements) {
                if (!this.#isElementVisible(element)) {
                    element.setAttribute('hidden', '')
                }
            }
        }

        #isElementVisible(element: Element): boolean {
            const name = element.getAttribute('data-if');
            throwIfNotDefined(name);
            const hasIfNot = element.hasAttribute('data-if-not');
            const hasIfEqual = element.hasAttribute('data-if-equal');
            const hasAttr = this.hasAttribute(name);
            if (hasIfEqual) {
                const value = returnIfDefined(element.getAttribute('data-if-equal'));
                const isEqual = this.getAttribute(name) === value;
                return hasIfNot ? !isEqual : isEqual;
            }
            return hasIfNot ? !hasAttr : hasAttr;
        }

        #attach(content: DocumentFragment): void {
            if (useShadow) {
                const shadowRoot = this.attachShadow({ mode: 'open' });
                shadowRoot.appendChild(content);
                this.#setShadowStyles();
            } else {
                this.#emulateSlots(content);
                this.appendChild(content);
            }
        }

        #emulateSlots(content: DocumentFragment): void {
            const defaultSlot = content.querySelector('slot:not([name])');
            const childNodes = Array.from(this.childNodes);
            this.innerHTML = '';
            const visitedSlots = new WeakSet<Element>();

            for (const node of childNodes) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const element = node as Element;
                    if (element.hasAttribute('slot')) {
                        const slotName = returnIfDefined(element.getAttribute('slot'));
                        const slot = content.querySelector(`slot[name=${slotName}]`);
                        if (!slot) {
                            console.warn(`No slot with name "${slotName}" found for ${selector}`);
                            continue;
                        }
                        slot.before(node);
                        visitedSlots.add(slot);
                        continue;
                    }
                }
                if (!defaultSlot) {
                    console.warn(`No default slot found for ${selector}`);
                    continue;
                }
                defaultSlot.before(node);
                visitedSlots.add(defaultSlot);
            }

            for (const slot of content.querySelectorAll('slot')) {
                if (!visitedSlots.has(slot)) {
                    slot.before(...slot.childNodes);
                }
                slot.remove();
            }
        }

        #applyAttr(name: string, value: string | null): void {
            const attrElements = this.#attrElements.filter((element) => element.getAttribute('data-attr') === name);
            for (const element of attrElements) {
                if (value !== null) {
                    element.textContent = value;
                } else {
                    const children = this.#attrDefaults.get(element) ?? [];
                    element.innerText = '';
                    element.append(...children);
                }
            }
        }

        #applyOptionality(name: string): void {
            const optionalForElements = this.#optionalElements.filter((element) => element.getAttribute('data-if') === name);
            for (const element of optionalForElements) {
                if (!this.#isElementVisible(element)) {
                    element.setAttribute('hidden', '');
                } else {
                    element.removeAttribute('hidden');
                }
            }
        }

        #setShadowStyles() {
            for (const style of styles) {
                const element = style.cloneNode(true);
                returnIfDefined(this.shadowRoot).appendChild(element);
            }
        }

        #execScripts(): void {
            for (const script of scripts) {
                const isModule = script.getAttribute('type') === 'module';
                const src = script.getAttribute('src');
                if (src) {
                    fetch(changeRelativeUrl(src, href))
                        .then((res) => res.text())
                        .then((code) => {
                            this.#execScript(code, isModule);
                        })
                        .catch(console.error);
                } else {
                    this.#execScript(script.innerText, isModule);
                }
            }
        }

        #execScript(code: string, isModule: boolean): void {
            if (isModule) {
                const moduleCode = setThisForModuleScript(code, this.#uuid, href);
                const url = URL.createObjectURL(new Blob([moduleCode], { type: 'text/javascript' }));
                import(url).then(() => URL.revokeObjectURL(url)).catch(console.error);
            } else {
                const fn = Function(code);
                try {
                    fn.call(this);
                } catch (e) {
                    if (!(e instanceof Error)) {
                        console.error(e);
                        return;
                    }
                    const stack = ErrorStackModifier.fromError(e);
                    const currentPlaceStackLength = ErrorStackModifier.current().items.length;
                    const cutSize = currentPlaceStackLength - 2;
                    const newStack = new ErrorStackModifier(stack.items.slice(0, -cutSize));
                    newStack.applyToRow((r) => r.replace('Component.eval', selector));
                    console.error(newStack.toString());
                }
            }
        }

        #setAttrs(): void {
            for (const attrElement of this.#attrElements) {
                this.#attrDefaults.set(attrElement, Array.from(attrElement.childNodes));
            }
            for (const name of this.getAttributeNames()) {
                this.#applyAttr(name, returnIfDefined(this.getAttribute(name)));
            }
        }

        #makeProperties(): void {
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

    return [selector, Component];
}

function getUsedAttributes(template: HTMLTemplateElement, dataAttributeNames: string[]): string[] {
    return dataAttributeNames
        .map((dataAttributeName) => {
            return Array.from(template.content.querySelectorAll(`[${dataAttributeName}]`))
                .map((element) => returnIfDefined(element.getAttribute(dataAttributeName)))
        })
        .flat()
        .filter((v, i, arr) => arr.indexOf(v) === i);
}
