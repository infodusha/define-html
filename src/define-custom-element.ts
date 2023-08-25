import {ErrorStackModifier} from './error-stack-modifier.js';
import {appendCssLink, applyGlobalStyles, getEncapsulatedCss} from './css-helpers.js';
import {
    cloneNode,
    registerComponent,
    returnIfDefined,
    setThisForModuleScript,
    throwIfNotDefined,
    unregisterComponent
} from './helpers.js';

interface AttributeChanged {
    attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
}

interface Connected {
    connectedCallback(): void;
}

interface Disconnected {
    disconnectedCallback(): void;
}

export function defineCustomElement(definedElement: Document): void {
    const template = returnIfDefined(definedElement.querySelector('template'), 'Template is required');
    const useShadow = template.hasAttribute('data-shadow');
    const selector = returnIfDefined(template.getAttribute('data-selector'), 'Selector is required');

    const styles: NodeListOf<HTMLStyleElement> = definedElement.querySelectorAll('style:not([data-global])');
    const globalStyles: NodeListOf<HTMLStyleElement> = definedElement.querySelectorAll('style[data-global]');
    const scripts = definedElement.querySelectorAll('script');

    applyGlobalStyles(Array.from(globalStyles));

    if(!useShadow) {
        for (const style of styles) {
            const cssText = getEncapsulatedCss(template, style, selector)
            appendCssLink(cssText);
        }
    }

    const usedAttributes = getUsedAttributes(template, ['data-attr', 'data-if']);

    class DefineHTMLElement extends HTMLElement implements AttributeChanged, Connected, Disconnected {
        static get observedAttributes(): string[] {
            return usedAttributes;
        }

        readonly #uuid = crypto.randomUUID();

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

        connectedCallback(): void {
            registerComponent(this.#uuid, this);
        }

        disconnectedCallback(): void {
            unregisterComponent(this.#uuid);
        }

        attributeChangedCallback(name: string, _oldValue: string, newValue: string): void {
            this.#applyAttr(name, newValue);
        }

        #getContent(): DocumentFragment {
            const content = cloneNode(template.content);
            for (const element of content.querySelectorAll(`[data-if]`)) {
                if (!this.#isElementVisible(element)) {
                    element.remove();
                }
            }
            return content;
        }

        #isElementVisible(element: Element): boolean {
            const hasIfNot = element.hasAttribute('data-if-not');
            const hasIfEqual = element.hasAttribute('data-if-equal');
            const name = element.getAttribute('data-if');
            throwIfNotDefined(name);
            const hasAttr = this.hasAttribute(name);
            if (hasIfEqual) {
                const value = element.getAttribute('data-if-equal')!;
                const isEqual = this.getAttribute(name) === value;
                return hasIfNot ? !isEqual : isEqual;
            }
            return hasIfNot ? !hasAttr : hasAttr;
        }

        #attach(): void {
            const content = this.#getContent();
            if (useShadow) {
                this.attachShadow({ mode: 'open' });
                this.shadowRoot!.appendChild(content);
            } else {
                this.#emulateSlots(content);
                this.appendChild(content);
            }
        }

        #emulateSlots(content: DocumentFragment): void {
            const slots = content.querySelectorAll('slot');

            if (slots.length === 0 && this.childNodes.length > 0) {
                // TODO make it work with named slots
                throw new Error(`No slot found for ${selector}`)
            }

            const namedSlotElements = Array.from(this.querySelectorAll('[slot]'));
            const childNodesAndElements =  this.#getChildNodesAndElements();
            this.innerHTML = '';

            for (const slot of slots) {
                let children;
                if (slot.hasAttribute('name')) {
                    const slotName =  slot.getAttribute('name')!;
                    children = namedSlotElements.filter(element => element.getAttribute('slot') === slotName);
                } else {
                    children = childNodesAndElements;
                }
                const items = children.length ? children : slot.childNodes;
                slot.before(...items);
                slot.remove();
            }
        }

        #getChildNodesAndElements(): Array<Node | Element> {
            const children = this.children;
            const childNodes = this.childNodes;
            const nodesAndElements: Array<Node | Element> = [];
            let i = 0;

            for (const node of childNodes) {
                if (node.nodeType === 8) { // COMMENT_NODE;
                    continue;
                }
                if (node.nodeType === 3) { // TEXT_NODE
                    nodesAndElements.push(node);
                } else {
                    const item = children[i];
                    throwIfNotDefined(item);
                    if (!item.hasAttribute('slot')) {
                        nodesAndElements.push(item);
                    }
                    i++;
                }
            }

            return nodesAndElements;
        }

        #applyAttr(name: string, value: string): void {
            const root = useShadow ? this.shadowRoot! : this;
            for (const element of root.querySelectorAll<HTMLElement>(`[data-attr='${name}']`)) {
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
                this.shadowRoot!.appendChild(element);
            }
        }

        #execScripts() {
            for (const script of scripts) {
                if (script.getAttribute('type') === 'module') {
                    const code = setThisForModuleScript(script.innerText, this.#uuid);
                    const url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
                    import(url).then(() => URL.revokeObjectURL(url)).catch(console.error);
                } else {
                    const code = Function(script.innerText);
                    try {
                        code.call(this);
                    } catch (e) {
                        if (!(e instanceof Error)) {
                           console.error(e);
                           continue;
                        }
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
                this.#applyAttr(name, this.getAttribute(name)!);
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

    customElements.define(selector, DefineHTMLElement);
}

function getUsedAttributes(template: HTMLTemplateElement, dataAttributeNames: string[]): string[] {
    return dataAttributeNames
        .map((dataAttributeName) => {
            return Array.from(template.content.querySelectorAll(`[${dataAttributeName}]`))
                .map((element) => element.getAttribute(dataAttributeName)!)
        })
        .flat()
        .filter((v, i, arr) => arr.indexOf(v) === i);
}
