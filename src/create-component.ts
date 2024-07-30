import { type CleanupFn, executeScript } from "./execute-script.js";
import { cloneNode, returnIfDefined } from "./helpers.js";
import { OptionalIf } from "./optional.js";

interface Lifecycle {
	connectedCallback?: () => void;
	disconnectedCallback?: () => void;
	adoptedCallback?: () => void;
	attributeChangedCallback?: (
		name: string,
		oldValue: string | null,
		newValue: string | null
	) => void;
}

export function createComponent(
	definedElement: Document,
	href: string,
	globalStyles: HTMLLinkElement[]
): typeof HTMLElement {
	const template = returnIfDefined(
		definedElement.querySelector("template"),
		"<template> is required"
	);

	const styles = definedElement.querySelectorAll("style");
	const scripts = definedElement.querySelectorAll("script");

	const usedAttributes = getUsedAttributes(template, ["data-attr", "data-if"]);

	class Component extends HTMLElement implements Lifecycle {
		static readonly observedAttributes = usedAttributes;

		readonly #attrElements: HTMLElement[] = [];
		readonly #attrDefaults = new WeakMap<HTMLElement, ChildNode[]>();

		readonly #optionalElements: OptionalIf[] = [];

		readonly #cleanupFns = new Set<CleanupFn>();

		constructor() {
			super();
			const content = cloneNode(template.content);
			this.#attrElements = Array.from(content.querySelectorAll("[data-attr]"));
			this.#optionalElements = this.#initOptionality(content);
			this.#attach(content);
			this.#setAttrs();
			this.#makeProperties();
			this.#execScripts();
		}

		disconnectedCallback(): void {
			for (const cleanup of this.#cleanupFns) {
				cleanup();
			}
			this.#cleanupFns.clear();
		}

		attributeChangedCallback(
			name: string,
			_oldValue: unknown,
			newValue: string | null
		): void {
			this.#applyAttr(name, newValue);
			this.#applyOptionality(name);
		}

		#initOptionality(content: DocumentFragment): OptionalIf[] {
			const optionalElements = Array.from(
				content.querySelectorAll("[data-if]")
			).map((el) => new OptionalIf(el));

			for (const element of optionalElements) {
				element.update(this.attributes);
			}

			return optionalElements;
		}

		#attach(content: DocumentFragment): void {
			const shadowRoot = this.attachShadow({ mode: "open" });
			shadowRoot.appendChild(content);
			this.#setShadowStyles(shadowRoot);
		}

		#applyAttr(name: string, value: string | null): void {
			const attrElements = this.#attrElements.filter(
				(element) => element.getAttribute("data-attr") === name
			);
			for (const element of attrElements) {
				if (value !== null) {
					element.textContent = value;
				} else {
					const children = this.#attrDefaults.get(element) ?? [];
					element.textContent = "";
					element.append(...children);
				}
			}
		}

		#applyOptionality(name: string): void {
			const optionalForElements = this.#optionalElements.filter(
				(element) => element.attr === name
			);
			for (const element of optionalForElements) {
				element.update(this.attributes);
			}
		}

		#setShadowStyles(shadowRoot: ShadowRoot) {
			const group = document.createElement("style");
			group.setAttribute("data-define-html", "");
			for (const style of styles) {
				group.append(cloneNode(style));
			}
			group.append(...globalStyles.map((el) => cloneNode(el)));
			shadowRoot.append(group);
		}

		#execScripts(): void {
			for (const script of scripts) {
				executeScript(script, href, this)
					.then((cleanup) => this.#cleanupFns.add(cleanup))
					.catch(console.error);
			}
		}

		#setAttrs(): void {
			for (const element of this.#attrElements) {
				this.#attrDefaults.set(element, Array.from(element.childNodes));
			}
			for (const name of this.getAttributeNames()) {
				this.#applyAttr(name, returnIfDefined(this.getAttribute(name)));
			}
		}

		#makeProperties(): void {
			for (const name of usedAttributes) {
				Object.defineProperty(this, name, {
					get() {
						return this.getAttribute(name) ?? undefined;
					},
					set(newValue: unknown) {
						if (newValue === null || newValue === undefined) {
							this.removeAttribute(name);
						} else {
							this.setAttribute(name, newValue);
						}
					},
					enumerable: true,
					configurable: true,
				});
			}
		}

		querySelector(selector: string): Element | null {
			return returnIfDefined(this.shadowRoot).querySelector(selector);
		}

		querySelectorAll(selector: string): NodeListOf<Element> {
			return returnIfDefined(this.shadowRoot).querySelectorAll(selector);
		}
	}

	return Component;
}

function getUsedAttributes(
	template: HTMLTemplateElement,
	attributeNames: string[]
): readonly string[] {
	return attributeNames
		.flatMap((attributeName) => {
			return Array.from(
				template.content.querySelectorAll(`[${attributeName}]`)
			).map((element) => returnIfDefined(element.getAttribute(attributeName)));
		})
		.filter((v, i, arr) => arr.indexOf(v) === i);
}
