import {
	appendCssLink,
	getEncapsulatedCss,
	type GlobalStyle,
} from "./css-helpers.js";
import { type CleanupFn, executeScript } from "./execute-script.js";
import { cloneNode, hrefToSelector, returnIfDefined } from "./helpers.js";
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
	globalStyles: GlobalStyle[]
): typeof HTMLElement {
	const template = returnIfDefined(
		definedElement.querySelector("template"),
		"<template> is required"
	);
	const selector = hrefToSelector(href);
	const useShadow = template.hasAttribute("data-shadow");

	const styles = definedElement.querySelectorAll("style");
	const scripts = definedElement.querySelectorAll("script");

	if (!useShadow) {
		for (const style of styles) {
			const cssText = getEncapsulatedCss(template, style, selector);
			appendCssLink(cssText);
		}
	}

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
			if (useShadow) {
				const shadowRoot = this.attachShadow({ mode: "open" });
				shadowRoot.appendChild(content);
				this.#setShadowStyles(shadowRoot);
			} else {
				this.#emulateSlots(content);
				this.appendChild(content);
			}
		}

		#emulateSlots(content: DocumentFragment): void {
			const defaultSlot = content.querySelector("slot:not([name])");
			const childNodes = Array.from(this.childNodes);
			this.innerHTML = "";
			const visitedSlots = new WeakSet<Element>();

			for (const node of childNodes) {
				if (node.nodeType === Node.ELEMENT_NODE) {
					const element = node as Element;
					if (element.hasAttribute("slot")) {
						const slotName = returnIfDefined(element.getAttribute("slot"));
						const slot = content.querySelector(`slot[name=${slotName}]`);
						if (!slot) {
							console.warn(
								`No slot with name "${slotName}" found for ${selector}`
							);
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

			for (const slot of content.querySelectorAll("slot")) {
				if (!visitedSlots.has(slot)) {
					slot.before(...slot.childNodes);
				}
				slot.remove();
			}
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
			for (const style of styles) {
				const element = style.cloneNode(true);
				shadowRoot.appendChild(element);
			}
			shadowRoot.append(...globalStyles);
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
