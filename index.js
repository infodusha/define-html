const parser = new DOMParser();
const ignoreDataAttribute = 'data-define-html-ignore';

document.addEventListener('DOMContentLoaded', () => {
    fetchFromLinks(document).catch(console.error);
});

async function fetchFromLinks(element) {
    const links = Array.from(element.querySelectorAll(`link[rel='preload'][as='fetch'][href$='.html']:not([${ignoreDataAttribute}])`));
    await Promise.all(links.map(defineHtml));
}

async function defineHtml(link) {
    const href = link.getAttribute('href');
    const response = await fetch(href);
    const text = await response.text();
    const definedElement = parser.parseFromString(text, 'text/html');
    createCustomElement(definedElement);
}

function createCustomElement(definedElement) {
    const template = definedElement.querySelector('template');
    const useShadow = template.hasAttribute('data-shadow');
    const selector = template.getAttribute('data-selector');
    const styles = definedElement.querySelectorAll('style');

    function setEmulatedStyles() {
        for (const style of styles) {
            const cssRules = [];

            for (const rule of style.sheet.cssRules) {
                rule.selectorText = rule.selectorText.replace(/:host/g, selector);
                rule.selectorText = rule.selectorText.replace(/:host\((.+)\)/g, `${selector}$1`);
                const re = new RegExp(`^(?!${selector})(.+?)\\s*`,'g');
                rule.selectorText = rule.selectorText.replace(re, `${selector} $1`);
                cssRules.push(rule);
            }

            const element = style.cloneNode(true);
            document.head.appendChild(element);

            while (element.sheet.cssRules.length !== 0) {
                element.sheet.deleteRule(0);
            }
            for (const rule of cssRules) {
                element.sheet.insertRule(rule.cssText);
            }
        }
    }

    if(!useShadow) {
        setEmulatedStyles();
    }

    class DefineHTMLElement extends HTMLElement {
        constructor() {
            super();
            const content = this.#getContent();
            this.#attach(content);
            this.#setAttrs();
            if (useShadow) {
                this.#setShadowStyles();
            }
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

        #attach(content) {
            if (useShadow) {
                const shadowRoot = this.attachShadow({ mode: 'closed' });
                shadowRoot.appendChild(content);
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

        #setAttrs() {
            const root = useShadow ? this.shadowRoot : this;
            for (const { name, value } of this.attributes) {
                for (const element of root.querySelectorAll(`[data-attr='${name}']`)) {
                    if (element.childNodes) {
                        // TODO handle case when there are already nodes inside
                    }
                    element.innerText = value;
                }
            }
        }

        #setShadowStyles() {
            for (const style of styles) {
                const element = style.cloneNode(true);
                this.shadowRoot.appendChild(element);
            }
        }
    }

    customElements.define(selector, DefineHTMLElement);
}
