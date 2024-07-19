import {
	appendCssLink,
	applyGlobalStyles,
	getEncapsulatedCss,
} from "./css-helpers.js";
import { cloneNode, returnIfDefined, throwIfNotDefined } from "./helpers.js";
import { type CleanupFn, executeScript } from "./execute-script.js";

interface AttributeChanged {
	attributeChangedCallback(
		name: string,
		oldValue: string | null,
		newValue: string | null
	): void;
}

interface Disconnected {
	disconnectedCallback(): void;
}

export function createComponent(
	definedElement: Document,
	relativeTo: string
): [string, typeof HTMLElement] {
	const template = returnIfDefined(
		definedElement.querySelector("template"),
		"Template is required"
	);
	const filename = returnIfDefined(relativeTo.split("/").pop()).replace(
		/\.html$/,
		""
	);
	const selector = template.getAttribute("data-selector") ?? filename;
	const useShadow = template.hasAttribute("data-shadow");

	const styles: NodeListOf<HTMLStyleElement> = definedElement.querySelectorAll(
		"style:not([data-global])"
	);
	const scripts: NodeListOf<HTMLScriptElement> =
		definedElement.querySelectorAll("script:not([data-global])");

	const globalStyles: NodeListOf<HTMLStyleElement> =
		definedElement.querySelectorAll("style[data-global]");
	const globalScripts: NodeListOf<HTMLScriptElement> =
		definedElement.querySelectorAll("script[data-global]");

	applyGlobalStyles(Array.from(globalStyles));
	for (const globalScript of globalScripts) {
		executeScript(globalScript, relativeTo).catch(console.error);
	}

	if (!useShadow) {
		for (const style of styles) {
			const cssText = getEncapsulatedCss(template, style, selector);
			appendCssLink(cssText);
		}
	}

	const usedAttributes = getUsedAttributes(template, ["data-attr", "data-if"]);

	class Component
		extends HTMLElement
		implements AttributeChanged, Disconnected
	{
		static get observedAttributes(): string[] {
			return usedAttributes;
		}

		readonly #attrElements: HTMLElement[] = [];
		readonly #attrDefaults = new WeakMap<HTMLElement, ChildNode[]>();

		readonly #optionalElements: HTMLElement[] = [];
		readonly #optionalMarkers = new WeakMap<HTMLElement, Comment>();

		readonly #cleanupFns = new Set<CleanupFn>();

		constructor() {
			super();
			const content = cloneNode(template.content);
			this.#attrElements = Array.from(content.querySelectorAll("[data-attr]"));
			this.#optionalElements = Array.from(
				content.querySelectorAll("[data-if]")
			);
			this.#initOptionality();
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

		#initOptionality(): void {
			for (const element of this.#optionalElements) {
				if (!this.#isElementVisible(element)) {
					this.#hideOptional(element);
				}
			}
		}

		#hideOptional(element: HTMLElement): void {
			if (this.#optionalMarkers.has(element)) {
				// Already hidden
				return;
			}
			const text = ` data-if="${element.getAttribute("data-if")}" `;
			const marker = document.createComment(text);
			element.before(marker);
			this.#optionalMarkers.set(element, marker);
			element.remove();
		}

		#isElementVisible(element: Element): boolean {
			const name = element.getAttribute("data-if");
			throwIfNotDefined(name);
			const hasIfNot = element.hasAttribute("data-if-not");
			const hasIfEqual = element.hasAttribute("data-if-equal");
			const hasAttr = this.hasAttribute(name);
			if (hasIfEqual) {
				const value = returnIfDefined(element.getAttribute("data-if-equal"));
				const isEqual = this.getAttribute(name) === value;
				return hasIfNot ? !isEqual : isEqual;
			}
			return hasIfNot ? !hasAttr : hasAttr;
		}

		#attach(content: DocumentFragment): void {
			if (useShadow) {
				const mode =
					(template.getAttribute("data-shadow") as ShadowRootMode | "") ||
					"open";
				const shadowRoot = this.attachShadow({ mode });
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
					element.innerText = "";
					element.append(...children);
				}
			}
		}

		#applyOptionality(name: string): void {
			const optionalForElements = this.#optionalElements.filter(
				(element) => element.getAttribute("data-if") === name
			);
			for (const element of optionalForElements) {
				if (this.#isElementVisible(element)) {
					const marker = this.#optionalMarkers.get(element);
					if (!marker) {
						// Already visible
						continue;
					}
					marker.after(element);
					marker.remove();
					this.#optionalMarkers.delete(element);
				} else {
					this.#hideOptional(element);
				}
			}
		}

		#setShadowStyles(shadowRoot: ShadowRoot) {
			for (const style of styles) {
				const element = style.cloneNode(true);
				returnIfDefined(shadowRoot).appendChild(element);
			}
		}

		#execScripts(): void {
			for (const script of scripts) {
				executeScript(script, relativeTo, this)
					.then((cleanup) => cleanup && this.#cleanupFns.add(cleanup))
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

	return [selector, Component];
}

function getUsedAttributes(
	template: HTMLTemplateElement,
	attributeNames: string[]
): string[] {
	return attributeNames
		.flatMap((attributeName) => {
			return Array.from(
				template.content.querySelectorAll(`[${attributeName}]`)
			).map((element) => returnIfDefined(element.getAttribute(attributeName)));
		})
		.filter((v, i, arr) => arr.indexOf(v) === i);
}
